const ethers = require('ethers');
const { gray, redBright: red, greenBright: green } = require('chalk');
const { BigNumber } = require('ethers');

const print = (number, hash, gasUsed, baseFee, nextBaseFee) => {
  const len = Math.round(gasUsed / 30e6 * 30);
  const per = Math.round(gasUsed / 30e6 * 100).toString().padStart(3, ' ');
  const dots = gray('·'.repeat(len).padEnd(30, ' '));
  const gas = gasUsed.toString().padStart(8, ' ');
  const fee = baseFee.toString().padStart(3, ' ');
  const color = nextBaseFee > baseFee ? red : green;
  const next = color(nextBaseFee.toString().padStart(3, ' '));
  const shorthash = hash.slice(2, 10);
  console.log(
    `[${number} ${shorthash}] ${per}% | ${gas} gas ${dots} ${fee} –> ${next} gwei`,
  );
};

async function main () {

  const providerURL = process.env.PROVIDER_URL;
  const provider = new ethers.providers.JsonRpcProvider(providerURL);

  const log = async () => {

    const [latestBlock, pendingBlock] = await Promise.all([
      provider.send('eth_getBlockByNumber', ['latest', false]),
      provider.send('eth_getBlockByNumber', ['pending', false]),
    ]);

    const number = BigNumber.from(latestBlock.number).toNumber();
    const hash = latestBlock.hash;

    const gasUsed = BigNumber.from(latestBlock.gasUsed).toNumber();
    const currentBaseFee = Math.round(latestBlock.baseFeePerGas / 1e9);
    const nextBaseFee = Math.round(pendingBlock.baseFeePerGas / 1e9);

    print(number, hash, gasUsed, currentBaseFee, nextBaseFee);
  };

  provider.on('block', () => {
    log().catch(console.error);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
