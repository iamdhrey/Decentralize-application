const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
  let token;
  let accounts;
  let deployer;
  let reciever;

  beforeEach(async () => {
    //Fetch Token from Blockchain
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("DreToken", "DRE", "1000000");

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    reciever = accounts[1];
    exchange = accounts[2];
  });

  describe("Deployment", () => {
    const name = "DreToken";
    const symbol = "DRE";
    const decimals = "18";
    const totalSupply = tokens("1000000");

    it("has a correct name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("has a correct Symbol", async () => {
      //Read Token Name
      const symbol = await token.symbol();
      //Check that name is correct
      expect(symbol).to.equal(symbol);
    });

    it("has exactly 18 decimals", async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it("has a million totalSupply", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it("assign total supply to deloyer", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });

  describe("Sending Tokens", () => {
    let amount;
    let transaction;
    let result;
    let exchange;

    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        //Transfer Token
        transaction = await token
          .connect(deployer)
          .transfer(reciever.address, amount);
        result = await transaction.wait();
      });

      it("transfer token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(999900)
        );
        expect(await token.balanceOf(reciever.address)).to.equal(amount);
      });

      it("emit a transfer balance", async () => {
        const log = result.events[0];
        // console.log(log);
        expect(log.event).to.equal("Transfer");
        const args = log.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(reciever.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("rejects insufficient balances", async () => {
        const invalidAmount = tokens(100000000);
        await expect(
          token.connect(deployer).transfer(reciever.address, invalidAmount)
        ).to.be.reverted;
      });

      it("reject Invalid Receipient", async () => {
        const amount = tokens(100);
        await expect(
          token
            .connect(deployer)
            .transfer("0x0000000000000000000000000000000000000000", amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Aproving Tokens", () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });
    describe("Success", () => {
      it("allocate an allowance for delegated token spending", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(amount);
      });

      it("emit a Approval event", async () => {
        const log = result.events[0];
        // console.log(log);
        expect(log.event).to.equal("Approve");
        const args = log.args;
        expect(args.owner).to.equal(deployer.address);
        expect(args.spender).to.equal(exchange.address);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("reject invalid spenders", async () => {
        await expect(
          token
            .connect(deployer)
            .approve("0x0000000000000000000000000000000000000000", amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Delegate Token Transfer", () => {
    let amount, result, transaction;

    beforeEach(async () => {
      amount = tokens(100);
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount);
      result = await transaction.wait();
    });

    describe("success", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployer.address, reciever.address, amount);
        result = await transaction.wait();
      });

      it("Transfers Token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.be.equal(
          ethers.utils.parseUnits("999900", "ether")
        );
        expect(await token.balanceOf(reciever.address)).to.be.equal(amount);
      });

      it("reset the allowance", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.be.equal(0);
      });

      it("emit a transfer event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(reciever.address);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("Rejects insufficient amounts", async () => {
        const invalidAmount = tokens(100000000); //More than total supply
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, reciever.address, invalidAmount)
        ).to.be.reverted;
      });
    });
  });
});
// Use chai(chaijs.com) = should, expect. assert
