# Das-Ren Adaptively Secure BLS Threshold Signatures (Charm-Crypto)

This is an educational implementation of Figures 2, 3, and 5 from *Adaptively Secure BLS Threshold Signatures from DDH and co-CDH*.

## Implemented components

- trusted-dealer `Setup` and `KGen`;
- `PSign`, the Fiat-Shamir Sigma proof, and `PVer`;
- exponent-space Lagrange interpolation in `Comb`;
- final `Ver`, identical to ordinary BLS verification;
- a local simulation of the modified JF-DKG sharing, agreement, complaint/disqualification, and key-derivation phases;
- six tests covering uniqueness, tamper rejection, threshold enforcement, and DKG behavior.

The paper notation maps to Charm as follows:

| Paper | Charm | Purpose |
|---|---|---|
| `G` | `G2` | public keys and commitments |
| `G-hat` | `G1` | message hashes and signatures |
| `e(pk, H(m))` | `pair(H(m), pk)` | Charm requires the `G1` argument first |

The default curve is `MNT224`, which provides asymmetric pairing groups in Charm-Crypto. It is useful for checking the algebraic construction, but it does not reproduce the paper's BLS12-381 benchmarks.

## Run

In the repository's configured WSL Charm environment:

```bash
cd /mnt/d/Study/github/guuacel.github.io/code/adaptively-secure-bls-threshold-signatures
python3 adaptive_bls_threshold.py
python3 -m unittest discover -p 'test_*.py' -v
```

## Core equations

Trusted key generation samples degree-`t` polynomials `s(x), r(x), u(x)` with `r(0)=u(0)=0`:

```text
sk_i = (s(i), r(i), u(i))
pk_i = g^s(i) h^r(i) v^u(i)
pk   = g^s(0)
```

A partial signature is:

```text
sigma_i = H0(m)^s(i) H1(m)^r(i)
```

Lagrange interpolation at zero gives:

```text
sigma = product(sigma_i ^ L_i,S) = H0(m)^s(0)
```

The `H1` factor disappears because `r(0)=0`, so the result remains a standard BLS signature.

## Security boundary

The code checks functional correctness and the robustness verification path; it does not execute the DDH/co-CDH reduction. Random-oracle programming, the SIP simulator, and rewinding are proof devices. A real deployment also needs authenticated private channels, reliable broadcast, participant authentication, domain separation, persistent state, side-channel defenses, and an audited BLS12-381 implementation.

See the [Chinese paper walkthrough](./docs/blog/adaptively-secure-bls-threshold-signatures.md) for the research problem, motivation, construction, and proof intuition.
