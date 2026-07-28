import unittest

from charm.toolbox.pairinggroup import G1

from adaptive_bls_threshold import (
    AdaptiveBLSThreshold,
    PartialSignature,
)


class AdaptiveBLSThresholdTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.scheme = AdaptiveBLSThreshold(n=5, threshold=2)

    def _partials(self, keys, message, signer_ids):
        return [
            self.scheme.partial_sign(
                keys.secret_shares[signer_id],
                keys.public_shares[signer_id],
                message,
            )
            for signer_id in signer_ids
        ]

    def test_trusted_setup_sign_combine_verify(self) -> None:
        keys = self.scheme.trusted_keygen()
        message = "paper figure 2"
        partials = self._partials(keys, message, (1, 2, 4))
        self.assertTrue(
            all(
                self.scheme.partial_verify(
                    keys.public_shares[partial.signer_id], message, partial
                )
                for partial in partials
            )
        )
        signature = self.scheme.combine(message, partials, keys.public_shares)
        self.assertTrue(self.scheme.verify(keys.public_key, message, signature))
        self.assertFalse(self.scheme.verify(keys.public_key, message + "!", signature))

    def test_any_threshold_subset_yields_the_unique_bls_signature(self) -> None:
        keys = self.scheme.trusted_keygen()
        message = "unique threshold signature"
        first = self.scheme.combine(
            message,
            self._partials(keys, message, (1, 2, 3)),
            keys.public_shares,
        )
        second = self.scheme.combine(
            message,
            self._partials(keys, message, (2, 4, 5)),
            keys.public_shares,
        )
        self.assertEqual(first, second)

    def test_rejects_tampered_partial_signature(self) -> None:
        keys = self.scheme.trusted_keygen()
        message = "proof binds the partial signature"
        partial = self._partials(keys, message, (1,))[0]
        tampered = PartialSignature(
            partial.signer_id,
            partial.sigma * self.scheme.group.random(G1),
            partial.proof,
        )
        self.assertFalse(
            self.scheme.partial_verify(keys.public_shares[1], message, tampered)
        )
        with self.assertRaisesRegex(ValueError, "invalid partial signature"):
            self.scheme.combine(
                message,
                (tampered,) + tuple(self._partials(keys, message, (2, 3))),
                keys.public_shares,
            )

    def test_requires_t_plus_one_distinct_signers(self) -> None:
        keys = self.scheme.trusted_keygen()
        message = "threshold check"
        partials = self._partials(keys, message, (1, 2))
        with self.assertRaisesRegex(ValueError, "at least 3"):
            self.scheme.combine(message, partials, keys.public_shares)
        with self.assertRaisesRegex(ValueError, "distinct signer IDs"):
            self.scheme.combine(
                message,
                (partials[0], partials[0], self._partials(keys, message, (3,))[0]),
                keys.public_shares,
            )

    def test_dkg_derives_usable_keys(self) -> None:
        dkg = self.scheme.distributed_keygen()
        self.assertEqual(dkg.qualified_dealers, (1, 2, 3, 4, 5))
        self.assertEqual(dkg.disqualified_dealers, ())
        message = "paper figure 5"
        signature = self.scheme.combine(
            message,
            self._partials(dkg.keys, message, (1, 3, 5)),
            dkg.keys.public_shares,
        )
        self.assertTrue(
            self.scheme.verify(dkg.keys.public_key, message, signature)
        )

    def test_dkg_disqualifies_inconsistent_dealer(self) -> None:
        dkg = self.scheme.distributed_keygen(faulty_dealers=(5,))
        self.assertEqual(dkg.disqualified_dealers, (5,))
        self.assertEqual(dkg.qualified_dealers, (1, 2, 3, 4))
        message = "complaint and disqualification"
        signature = self.scheme.combine(
            message,
            self._partials(dkg.keys, message, (1, 2, 4)),
            dkg.keys.public_shares,
        )
        self.assertTrue(
            self.scheme.verify(dkg.keys.public_key, message, signature)
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
