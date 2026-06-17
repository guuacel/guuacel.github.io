# Efficiently-Thresholdizable Batched Identity Based Encryption, with Applications

This folder stores Charm-Crypto demo implementations for the paper "Efficiently-Thresholdizable Batched Identity Based Encryption, with Applications".

## Files

- `basic_bibe.py`: Basic BIBE and batched decryption demo.
- `batched_encryption.py`: Signed Batched Encryption wrapper built on top of Basic BIBE.
- `evaluation_point_bibe.py`: Evaluation-point BIBE variant from Section 6.5.
- `README_basic_bibe.md`: Notes for the Basic BIBE implementation.
- `README_batched_encryption.md`: Notes for the signed Batched Encryption wrapper.
- `README_evaluation_point_bibe.md`: Notes for the evaluation-point BIBE variant.

These files are research and teaching demos. They require Charm-Crypto and use pairing-group operations through Charm's `PairingGroup` API.
