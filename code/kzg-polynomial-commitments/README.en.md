# KZG Polynomial Commitment Implementation Notes

Implementation file: [kzg_commitment.py](./kzg_commitment.py)

KZG is a constant-size polynomial commitment scheme proposed by Kate, Zaverucha, and Goldberg in *Constant-Size Commitments to Polynomials and Their Applications*. A polynomial commitment lets a prover commit to a polynomial \(f(X)\) with a short commitment and later open the commitment at any point \(z\) by proving that \(f(z)=y\). The verifier only needs to check a pairing equation.

## Paper Information

- Paper: *Constant-Size Commitments to Polynomials and Their Applications*
- Authors: Aniket Kate, Gregory M. Zaverucha, Ian Goldberg
- Conference: ASIACRYPT 2010
- LNCS: 6477
- Pages: 177-194
- DOI: `10.1007/978-3-642-17373-8_11`

## What Is a KZG Polynomial Commitment?

A polynomial commitment can be understood as "commit to a polynomial first, then selectively open evaluations later." The committer publishes a short commitment \(C\). To claim that:

$$
f(z)=y
$$

the committer provides a short proof \(\pi\), allowing the verifier to check that the claimed value comes from the same committed polynomial.

KZG has the following properties:

- The commitment is one group element.
- A single-point opening proof is one group element.
- Verification uses a constant number of pairing operations.
- Multi-point openings can also keep the proof size constant.

## Notation

Let:

$$
G_1,\quad G_2,\quad G_T
$$

be prime-order bilinear groups with group order:

$$
p
$$

The bilinear map is:

$$
e:G_1\times G_2\rightarrow G_T
$$

Charm uses multiplicative group notation. This implementation calls:

```python
pair(g1_elem, g2_elem)
```

Polynomial coefficients are stored in increasing degree order:

$$
f(X)=a_0+a_1X+\cdots+a_dX^d
$$

In code:

```python
polynomial = [a0, a1, ..., ad]
```

## Setup

The trusted setup samples a trapdoor:

$$
\tau\leftarrow\mathbb Z_p
$$

and publishes powers of tau in both \(G_1\) and \(G_2\):

$$
[1]_1,\ [\tau]_1,\ [\tau^2]_1,\ldots,[\tau^D]_1
$$

$$
[1]_2,\ [\tau]_2,\ [\tau^2]_2,\ldots,[\tau^D]_2
$$

where \(D\) is the maximum supported polynomial degree. After setup, the real \(\tau\) should be destroyed. The verifier only uses the public parameters to compute \([I_S(\tau)]_1\) and \([Z_S(\tau)]_2\).

Code entry point:

```python
kzg = KZGCommitment(curve="MNT224", max_degree=8)
```

## Commit

For:

$$
f(X)=\sum_{i=0}^{d}a_iX^i
$$

the commitment is:

$$
C=[f(\tau)]_1=\prod_{i=0}^{d}[\tau^i]_1^{a_i}
$$

Code entry point:

```python
commitment = kzg.commit(polynomial)
```

## Open

To open at point \(z\), first compute:

$$
y=f(z)
$$

Then construct the quotient polynomial:

$$
q(X)=\frac{f(X)-y}{X-z}
$$

Because \(y=f(z)\), the numerator \(f(X)-y\) is divisible by \(X-z\).

The proof is:

$$
\pi=[q(\tau)]_1
$$

Code entry point:

```python
proof = kzg.open(polynomial, point)
```

## Verify

The verifier checks:

$$
e(C/[y]_1,g_2)\stackrel{?}{=}e(\pi,[\tau-z]_2)
$$

where:

$$
[\tau-z]_2=[\tau]_2/[z]_2
$$

Correctness follows from:

$$
f(X)-y=q(X)(X-z)
$$

Substituting \(X=\tau\) gives:

$$
f(\tau)-y=q(\tau)(\tau-z)
$$

Therefore:

$$
e([f(\tau)-y]_1,g_2)=e([q(\tau)]_1,[\tau-z]_2)
$$

Code entry point:

```python
ok = kzg.verify(commitment, proof)
```

## Batch Open

To open several points at once:

$$
S=\{z_1,\ldots,z_m\}
$$

interpolate a polynomial \(I_S(X)\) of degree less than \(m\) such that:

$$
I_S(z_i)=f(z_i)
$$

Then build the vanishing polynomial:

$$
Z_S(X)=\prod_{i=1}^{m}(X-z_i)
$$

Since \(f(X)-I_S(X)\) is zero at every \(z_i\), define:

$$
q(X)=\frac{f(X)-I_S(X)}{Z_S(X)}
$$

The batch proof is still one group element:

$$
\pi=[q(\tau)]_1
$$

Code entry point:

```python
proof = kzg.batch_open(polynomial, points)
```

## Batch Verify

The verifier reconstructs \(I_S(X)\) and \(Z_S(X)\) from the public points and values, then checks:

$$
e(C/[I_S(\tau)]_1,g_2)\stackrel{?}{=}e(\pi,[Z_S(\tau)]_2)
$$

Code entry point:

```python
ok = kzg.batch_verify(commitment, proof)
```

## Run

Run the demo in an environment with Charm-Crypto installed:

```powershell
python .\code\kzg-polynomial-commitments\kzg_commitment.py
```

The output demonstrates:

- KZG setup
- Polynomial commitment
- Single-point opening and verification
- Failed verification after tampering with the claimed value
- Multi-point batch opening and verification

## Implementation Notes

This implementation is intended for learning and paper reproduction. It focuses on the algebraic structure of KZG. A production system would need stricter handling of trusted setup, curve selection, hash-to-field, serialization, batch verification APIs, constant-time implementation, and input validation.
