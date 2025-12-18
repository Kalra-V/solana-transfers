/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_transfers.json`.
 */
export type SolanaTransfers = {
  "address": "4s2eUn3rBK2y6KSgPgMmkucsPPogxMPbK5HtUNhfV91y",
  "metadata": {
    "name": "solanaTransfers",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "transferSol",
      "discriminator": [
        78,
        10,
        236,
        247,
        109,
        117,
        21,
        76
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferSolFromPda",
      "discriminator": [
        47,
        16,
        236,
        110,
        50,
        118,
        225,
        170
      ],
      "accounts": [
        {
          "name": "pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  120,
                  121,
                  122,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "recipient"
              }
            ]
          }
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferSolToPda",
      "discriminator": [
        231,
        93,
        192,
        169,
        71,
        218,
        168,
        61
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient",
          "docs": [
            "So we use init_if_needed to ensure the account is created if its not there"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  120,
                  121,
                  122,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferTokens",
      "discriminator": [
        54,
        180,
        238,
        175,
        74,
        85,
        126,
        188
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "senderTokenAccount",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferTokensFromPda",
      "discriminator": [
        216,
        184,
        217,
        14,
        88,
        44,
        70,
        104
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pda",
          "docs": [
            "So we use init_if_needed to ensure the account is created if its not there"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  120,
                  121,
                  122,
                  112,
                  100,
                  97,
                  115,
                  116,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true
        },
        {
          "name": "receiverTokenAccount",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferTokensToPda",
      "discriminator": [
        219,
        207,
        216,
        92,
        57,
        89,
        250,
        245
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "senderTokenAccount",
          "writable": true
        },
        {
          "name": "pda",
          "docs": [
            "So we use init_if_needed to ensure the account is created if its not there"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  120,
                  121,
                  122,
                  112,
                  100,
                  97,
                  115,
                  116,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "pdaTokenAccount",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ]
};
