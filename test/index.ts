import chai, { expect } from "chai";
import ChaiAsPromised from "chai-as-promised";
import { utils } from "ethers";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import CollectionConfig from "../config/CollectionConfig";
import ContractArguments from "../config/ContractArguments";
import { NftContractType } from "../lib/NftContractProvider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(ChaiAsPromised);

describe(CollectionConfig.contractName, async function () {
  let contract!: NftContractType;
  let owner!: SignerWithAddress;
  let receiver!: SignerWithAddress;
  let otherWallet!: SignerWithAddress;

  before(async function () {
    [owner, receiver, otherWallet] = await ethers.getSigners();
  });

  it("Contract deployment", async function () {
    const Contract = await ethers.getContractFactory(
      CollectionConfig.contractName,
      owner
    );
    contract = (await Contract.deploy(
      ...ContractArguments
    )) as unknown as NftContractType;

    await contract.deployed();
  });

  it("Check initial data", async function () {
    expect(await contract.name()).to.equal(CollectionConfig.tokenName);
    expect(await contract.symbol()).to.equal(CollectionConfig.tokenSymbol);

    expect(await contract.balanceOf(await owner.getAddress())).to.equal(100000000);
    expect(await contract.balanceOf(await receiver.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await otherWallet.getAddress())).to.equal(0);
  });

  it("Owner only functions", async function () {
    await expect(
      contract.connect(await otherWallet.getAddress()).mint(await otherWallet.getAddress(), 10)
    ).to.be.revertedWith("");

    await expect(
      contract.connect(await otherWallet.getAddress()).airdropToken(await otherWallet.getAddress(), 10)
    ).to.be.revertedWith("");
  });

  it("Airdrop Mint", async function () {
    await expect(
      contract.connect(owner).airdropToken(await receiver.getAddress(), 0)
    ).to.be.revertedWith("InvalidAmount");

    await contract.connect(owner).airdropToken(await receiver.getAddress(), 100);

    expect(await contract.balanceOf(await receiver.getAddress())).to.equal(100);
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(99999900);
  });

  it("Mint Token", async function () {
    await expect(
      contract.connect(owner).mint(await owner.getAddress(), 0)
    ).to.be.revertedWith("InvalidAmount");

    await contract.connect(owner).mint(await owner.getAddress(), 200);

    expect(await contract.balanceOf(await owner.getAddress())).to.equal(100000100);

  });
});
