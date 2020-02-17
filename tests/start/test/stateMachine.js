const { expectRevert, time } = require('@openzeppelin/test-helpers');
const StateMachine = artifacts.require('StateMachine.sol');

contract('StateMachine', (accounts) => {
  let stateMachine;
  const amount = 1000;
  const interest = 100;
  const duration = 100;

  const [borrower, lender] = [accounts[1], accounts[2]];
  before(async () => {
    stateMachine = await StateMachine.deployed();
  });

  it('Should NOT accept fund if not lender', async () => {
    await expectRevert(
      stateMachine.fund({from: borrower, value: 1000}),
        'only lender can lend'
    );
  });

  it('Should NOT accept fund if not exact amount', async () => {
    await expectRevert(
      stateMachine.fund({from: lender, value: 999}),
        'can only lend the exact amount'
    );
  });

  it('Should accept fund', async () => {
    await stateMachine.fund({from: lender, value: amount});
  });

  it('Should NOT reimburse if not borrower', async () => {
    await expectRevert(
      stateMachine.reimburse({from: lender, value: amount + interest}),
        'only borrower can reimburse'
    );
  });

  it('Should NOT reimburse if loan hasnt matured yet', async () => {
    await expectRevert(
      stateMachine.reimburse({from: borrower, value: amount + interest}),
        'loan hasnt matured yet'
    );
  });
  
  it('Should reimburse', async () => {
    await time.increase(duration);
    await stateMachine.reimburse({from: borrower, value: amount + interest});
  });
});
