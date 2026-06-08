# Boneh-Franklin IBE and Escrow ElGamal

This folder stores Charm-Crypto demo implementations for algorithms discussed in Dan Boneh and Matt Franklin, "Identity-Based Encryption from the Weil Pairing".

- `basic_ident.py`: BasicIdent IBE.
- `full_ident.py`: FullIdent IBE with the Fujisaki-Okamoto transform.
- `escrow_elgamal_encryption.py`: ElGamal encryption with a global escrow key.

These files are research and teaching demos. They use Charm-Crypto pairing groups and `group.hash(..., G1)` instead of manually implementing the paper's concrete Weil-pairing curve and MapToPoint construction.
