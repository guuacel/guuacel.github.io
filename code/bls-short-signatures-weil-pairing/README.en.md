# BLS Short Signature Implementation Notes

Implementation file: [bls_signature.py](./bls_signature.py)

This document implements the BLS short signature scheme proposed by Boneh, Lynn, and Shacham in *Short Signatures from the Weil Pairing*. The implementation uses Charm-Crypto's `PairingGroup` and bilinear pairing interface. It follows the common asymmetric-pairing convention where signatures live in \(G_1\) and public keys live in \(G_2\).

## Paper Information

- Paper: *Short Signatures from the Weil Pairing*
- Authors: Dan Boneh, Ben Lynn, Hovav Shacham
- Conference: ASIACRYPT 2001
- LNCS: 2248
- Pages: 514-532
- DOI: `10.1007/3-540-45682-1_30`

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

and satisfies:

$$
e(aP,bQ)=e(P,Q)^{ab}
$$

The implementation calls Charm's pairing API as:

```python
pair(g1_elem, g2_elem)
```

## Setup

Generate the bilinear group and choose generators:

$$
g_1\in G_1,\qquad g_2\in G_2
$$

Define a hash-to-group function:

$$
H:\{0,1\}^{*}\rightarrow G_1
$$

Code entry point:

```python
bls = BLSSignature(curve="MNT224")
```

The implementation uses domain separation:

```python
self.group.hash(("BLS-H", message), G1)
```

## KeyGen

Sample a secret key:

$$
x\leftarrow \mathbb Z_p
$$

Compute the public key:

$$
pk=g_2^x
$$

Code entry point:

```python
secret_key, public_key = bls.keygen()
```

## Sign

Given secret key \(x\) and message \(m\), first hash the message:

$$
h=H(m)\in G_1
$$

The signature is:

$$
\sigma=h^x=H(m)^x
$$

Code entry point:

```python
signature = bls.sign(secret_key, message)
```

## Verify

The verifier checks:

$$
e(\sigma,g_2)\stackrel{?}{=}e(H(m),pk)
$$

Correctness follows from:

$$
e(\sigma,g_2)=e(H(m)^x,g_2)=e(H(m),g_2)^x
$$

and:

$$
e(H(m),pk)=e(H(m),g_2^x)=e(H(m),g_2)^x
$$

Code entry point:

```python
ok = bls.verify(public_key, message, signature)
```

## Aggregate Signatures on Distinct Messages

For multiple signatures:

$$
\sigma_i=H(m_i)^{x_i}
$$

the aggregate signature is:

$$
\sigma=\prod_i\sigma_i
$$

The verification equation is:

$$
e(\sigma,g_2)\stackrel{?}{=}\prod_i e(H(m_i),pk_i)
$$

Code entry point:

```python
aggregate = bls.aggregate_signatures(signatures)
ok = bls.aggregate_verify_distinct_messages(public_keys, messages, aggregate)
```

## Fast Aggregate Verification for a Common Message

When several signers sign the same message \(m\), their public keys can first be aggregated:

$$
pk=\prod_i pk_i
$$

The aggregate signature remains:

$$
\sigma=\prod_i\sigma_i
$$

The verifier checks:

$$
e(\sigma,g_2)\stackrel{?}{=}e(H(m),\prod_i pk_i)
$$

Code entry point:

```python
ok = bls.fast_aggregate_verify_same_message(public_keys, message, aggregate)
```

In production systems, same-message fast aggregate verification usually also needs proof-of-possession or another rogue-key defense. This demo focuses on the core BLS algebra and does not implement proof-of-possession.

## Run

Run the demo in an environment with Charm-Crypto installed:

```powershell
python .\code\bls-short-signatures-weil-pairing\bls_signature.py
```

The output demonstrates:

- Single BLS signature generation and verification
- Failed verification after message tampering
- Aggregate verification for distinct messages
- Fast aggregate verification for a common message
