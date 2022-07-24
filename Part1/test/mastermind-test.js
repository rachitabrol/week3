//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16,plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const buildPoseidon = require("circomlibjs").buildPoseidon;

describe("Mastermind Secret Search", function () {
    this.timeout(100000000);

    before(async () => {
        poseidon = await buildPoseidon();
    });


    it("Should work for correct guess", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 1, 
            pubGuessB: 2, 
            pubGuessC: 3, 
            pubGuessD: 4,
            pubNumHit: 4,
            pubNumBlow: 0, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT.pubSolnHash)));
    });
    it("Should work for incorrect guess (3 hit 0 blow)", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 1, 
            pubGuessB: 2, 
            pubGuessC: 3, 
            pubGuessD: 25,
            pubNumHit: 3,
            pubNumBlow: 0, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT.pubSolnHash)));
    });

    it("Should work for incorrect guess (2 hit 2 blow)", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 1, 
            pubGuessB: 2, 
            pubGuessC: 4, 
            pubGuessD: 3,
            pubNumHit: 2,
            pubNumBlow: 2, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT.pubSolnHash)));
    });
    it("Should work for incorrect guess (0 hit 0 blow)", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 8, 
            pubGuessB: 10, 
            pubGuessC: 11, 
            pubGuessD: 25,
            pubNumHit: 0,
            pubNumBlow: 0, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        const witness = await circuit.calculateWitness(INPUT, true);
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT.pubSolnHash)));
    });
    it("Should fail for incorrect hits", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 1, 
            pubGuessB: 10, 
            pubGuessC: 11, 
            pubGuessD: 25,
            pubNumHit: 0,
            pubNumBlow: 0, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });
    it("Should fail for incorrect blows", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        const salt = ethers.BigNumber.from(
            ethers.utils.randomBytes(32)
        ).toString();
        const pubSolnHash = ethers.BigNumber.from(
            poseidon.F.toObject(poseidon([salt, 1,2,3,4]))
        ).toString();
        const INPUT = {
            pubGuessA: 22, 
            pubGuessB: 1, 
            pubGuessC: 11, 
            pubGuessD: 25,
            pubNumHit: 0,
            pubNumBlow: 0, 
            pubSolnHash: pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSalt: salt,
        };
        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });
});