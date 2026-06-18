from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable, List, Sequence, Tuple

try:
    from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, G2, pair
except ImportError as exc:  # pragma: no cover - depends on local environment
    PairingGroup = None
    ZR = G1 = G2 = None
    pair = None
    _CHARM_IMPORT_ERROR = exc
else:
    _CHARM_IMPORT_ERROR = None


def require_charm() -> None:
    if PairingGroup is None:
        raise RuntimeError(
            "charm-crypto is not installed in the current Python environment. "
            "Install Charm-Crypto before running this file."
        ) from _CHARM_IMPORT_ERROR


def timed(label: str, fn: Callable[[], Any]) -> Any:
    start = time.perf_counter()
    value = fn()
    elapsed_ms = (time.perf_counter() - start) * 1000
    print(f"{label} elapsed time: {elapsed_ms:.3f} ms")
    return value


def short(value: Any, limit: int = 96) -> str:
    text = str(value)
    if len(text) > limit:
        return text[:limit] + "..."
    return text


def zr_zero(group: Any) -> Any:
    return group.init(ZR, 0)


def zr_one(group: Any) -> Any:
    return group.init(ZR, 1)


def trim(group: Any, polynomial: List[Any]) -> List[Any]:
    zero = zr_zero(group)
    while len(polynomial) > 1 and polynomial[-1] == zero:
        polynomial.pop()
    return polynomial


def evaluate_polynomial(group: Any, polynomial: Sequence[Any], x: Any) -> Any:
    result = zr_zero(group)
    for coefficient in reversed(polynomial):
        result = result * x + coefficient
    return result


def subtract_constant(group: Any, polynomial: Sequence[Any], value: Any) -> List[Any]:
    out = list(polynomial)
    if not out:
        out = [zr_zero(group)]
    out[0] -= value
    return trim(group, out)


def divide_by_linear(group: Any, polynomial: Sequence[Any], point: Any) -> Tuple[List[Any], Any]:
    """
    Divide polynomial f(X) by X - point.

    Coefficients are in increasing order. Returns quotient and remainder.
    """
    if len(polynomial) == 0:
        return [zr_zero(group)], zr_zero(group)

    descending = list(reversed(polynomial))
    quotient_desc = []
    carry = descending[0]
    quotient_desc.append(carry)
    for coefficient in descending[1:]:
        carry = coefficient + carry * point
        quotient_desc.append(carry)

    remainder = quotient_desc.pop()
    quotient = list(reversed(quotient_desc)) if quotient_desc else [zr_zero(group)]
    return trim(group, quotient), remainder


def interpolate(group: Any, points: Sequence[Tuple[Any, Any]]) -> List[Any]:
    if not points:
        return [zr_zero(group)]

    xs = [point[0] for point in points]
    if len({str(x) for x in xs}) != len(xs):
        raise ValueError("interpolation x-coordinates must be distinct")

    result = [zr_zero(group)]
    for i, (xi, yi) in enumerate(points):
        basis = [zr_one(group)]
        denominator = zr_one(group)
        for j, (xj, _) in enumerate(points):
            if i == j:
                continue
            basis = multiply_polynomials(group, basis, [-xj, zr_one(group)])
            denominator *= xi - xj
        scale = yi / denominator
        if len(result) < len(basis):
            result.extend(zr_zero(group) for _ in range(len(basis) - len(result)))
        for k, coefficient in enumerate(basis):
            result[k] += coefficient * scale
    return trim(group, result)


def multiply_polynomials(group: Any, a: Sequence[Any], b: Sequence[Any]) -> List[Any]:
    out = [zr_zero(group) for _ in range(len(a) + len(b) - 1)]
    for i, ai in enumerate(a):
        for j, bj in enumerate(b):
            out[i + j] += ai * bj
    return trim(group, out)


def vanishing_polynomial(group: Any, points: Sequence[Any]) -> List[Any]:
    polynomial = [zr_one(group)]
    for point in points:
        polynomial = multiply_polynomials(group, polynomial, [-point, zr_one(group)])
    return polynomial


def divide_polynomials(group: Any, numerator: Sequence[Any], denominator: Sequence[Any]) -> Tuple[List[Any], List[Any]]:
    num = list(numerator)
    den = trim(group, list(denominator))
    if not den or den == [zr_zero(group)]:
        raise ZeroDivisionError("denominator polynomial is zero")
    if len(num) < len(den):
        return [zr_zero(group)], trim(group, num)

    quotient = [zr_zero(group) for _ in range(len(num) - len(den) + 1)]
    while len(num) >= len(den) and not (len(num) == 1 and num[0] == zr_zero(group)):
        degree = len(num) - len(den)
        scale = num[-1] / den[-1]
        quotient[degree] += scale
        for i in range(len(den)):
            num[degree + i] -= scale * den[i]
        trim(group, num)
    return trim(group, quotient), trim(group, num)


@dataclass(frozen=True)
class PublicParameters:
    group: Any
    curve: str
    max_degree: int
    g1: Any
    g2: Any
    tau_g1_powers: Tuple[Any, ...]
    tau_g2_powers: Tuple[Any, ...]
    tau_g2: Any


@dataclass(frozen=True)
class OpeningProof:
    point: Any
    value: Any
    witness: Any


@dataclass(frozen=True)
class BatchOpeningProof:
    points: Tuple[Any, ...]
    values: Tuple[Any, ...]
    witness: Any


class KZGCommitment:
    """
    KZG polynomial commitment demo.

    Coefficients are stored in increasing order:
    f(X) = coeffs[0] + coeffs[1] X + ... + coeffs[d] X^d.
    """

    def __init__(self, curve: str = "MNT224", max_degree: int = 8):
        require_charm()
        self.group = PairingGroup(curve)
        self.curve = curve
        self.max_degree = max_degree
        self.g1 = self.group.random(G1)
        self.g2 = self.group.random(G2)
        self.tau = self.group.random(ZR)

        g1_powers = []
        g2_powers = []
        current = zr_one(self.group)
        for _ in range(max_degree + 1):
            g1_powers.append(self.g1 ** current)
            g2_powers.append(self.g2 ** current)
            current *= self.tau

        self.params = PublicParameters(
            group=self.group,
            curve=curve,
            max_degree=max_degree,
            g1=self.g1,
            g2=self.g2,
            tau_g1_powers=tuple(g1_powers),
            tau_g2_powers=tuple(g2_powers),
            tau_g2=self.g2 ** self.tau,
        )

    def random_polynomial(self, degree: int) -> List[Any]:
        if degree > self.max_degree:
            raise ValueError("degree exceeds max_degree")
        return [self.group.random(ZR) for _ in range(degree + 1)]

    def commit(self, polynomial: Sequence[Any]) -> Any:
        if len(polynomial) - 1 > self.max_degree:
            raise ValueError("polynomial degree exceeds setup max_degree")
        commitment = self.group.init(G1, 1)
        for coefficient, tau_power in zip(polynomial, self.params.tau_g1_powers):
            commitment *= tau_power ** coefficient
        return commitment

    def commit_g2(self, polynomial: Sequence[Any]) -> Any:
        if len(polynomial) - 1 > self.max_degree:
            raise ValueError("polynomial degree exceeds setup max_degree")
        commitment = self.group.init(G2, 1)
        for coefficient, tau_power in zip(polynomial, self.params.tau_g2_powers):
            commitment *= tau_power ** coefficient
        return commitment

    def open(self, polynomial: Sequence[Any], point: Any) -> OpeningProof:
        value = evaluate_polynomial(self.group, polynomial, point)
        numerator = subtract_constant(self.group, polynomial, value)
        quotient, remainder = divide_by_linear(self.group, numerator, point)
        if remainder != zr_zero(self.group):
            raise ValueError("division by X - point left a non-zero remainder")
        return OpeningProof(point=point, value=value, witness=self.commit(quotient))

    def verify(self, commitment: Any, proof: OpeningProof) -> bool:
        left = pair(commitment / (self.g1 ** proof.value), self.g2)
        right = pair(proof.witness, self.params.tau_g2 / (self.g2 ** proof.point))
        return left == right

    def batch_open(self, polynomial: Sequence[Any], points: Sequence[Any]) -> BatchOpeningProof:
        values = [evaluate_polynomial(self.group, polynomial, point) for point in points]
        interpolation = interpolate(self.group, list(zip(points, values)))
        numerator = list(polynomial)
        if len(numerator) < len(interpolation):
            numerator.extend(zr_zero(self.group) for _ in range(len(interpolation) - len(numerator)))
        for i, coefficient in enumerate(interpolation):
            numerator[i] -= coefficient

        divisor = vanishing_polynomial(self.group, points)
        quotient, remainder = divide_polynomials(self.group, numerator, divisor)
        if any(coefficient != zr_zero(self.group) for coefficient in remainder):
            raise ValueError("batch division left a non-zero remainder")
        return BatchOpeningProof(points=tuple(points), values=tuple(values), witness=self.commit(quotient))

    def batch_verify(self, commitment: Any, proof: BatchOpeningProof) -> bool:
        interpolation = interpolate(self.group, list(zip(proof.points, proof.values)))
        interpolation_commitment = self.commit(interpolation)
        divisor = vanishing_polynomial(self.group, proof.points)
        divisor_at_tau_g2 = self.commit_g2(divisor)
        return pair(commitment / interpolation_commitment, self.g2) == pair(proof.witness, divisor_at_tau_g2)


def demo_single_opening() -> None:
    print("========== KZG single-point opening demo ==========")
    kzg = timed("-----setup-----\n", lambda: KZGCommitment(curve="MNT224", max_degree=8))
    print(f"Public parameters: curve={kzg.curve}, max_degree={kzg.max_degree}")
    print(f"Generators: g1={short(kzg.g1)}, g2={short(kzg.g2)}")

    polynomial = timed("-----sample polynomial-----\n", lambda: kzg.random_polynomial(degree=4))
    print("Polynomial coefficients:")
    for index, coefficient in enumerate(polynomial):
        print(f"  a_{index}={short(coefficient)}")

    commitment = timed("-----commit-----\n", lambda: kzg.commit(polynomial))
    print(f"Commitment C=[f(tau)]_1={short(commitment)}")

    point = kzg.group.random(ZR)
    proof = timed("-----open-----\n", lambda: kzg.open(polynomial, point))
    print(f"Opening point z={short(proof.point)}")
    print(f"Claimed value y=f(z)={short(proof.value)}")
    print(f"Proof pi=[q(tau)]_1={short(proof.witness)}")

    ok = timed("-----verify-----\n", lambda: kzg.verify(commitment, proof))
    print(f"Single-point verification passed: {ok}")

    bad_proof = OpeningProof(point=proof.point, value=proof.value + zr_one(kzg.group), witness=proof.witness)
    bad_ok = kzg.verify(commitment, bad_proof)
    print(f"Tampered-value verification passed: {bad_ok}")


def demo_batch_opening() -> None:
    print("\n========== KZG multi-point batch opening demo ==========")
    kzg = KZGCommitment(curve="MNT224", max_degree=8)
    polynomial = kzg.random_polynomial(degree=5)
    commitment = kzg.commit(polynomial)
    points = [kzg.group.random(ZR) for _ in range(3)]

    proof = timed("Batch open", lambda: kzg.batch_open(polynomial, points))
    ok = timed("Batch verify", lambda: kzg.batch_verify(commitment, proof))
    print(f"Number of batch points: {len(points)}")
    for point, value in zip(proof.points, proof.values):
        print(f"  z={short(point)}, f(z)={short(value)}")
    print(f"Batch verification passed: {ok}")


if __name__ == "__main__":
    try:
        demo_single_opening()
        demo_batch_opening()
    except RuntimeError as error:
        print(error)
