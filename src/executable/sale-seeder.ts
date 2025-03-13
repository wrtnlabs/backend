import { HubSaleSeeder } from "../setup/seeders/HubSaleSeeder";
import { StopWatch } from "../utils/StopWatch";

const main = async () => {
  await StopWatch.trace("Demo scenario sale seed")(HubSaleSeeder.seed);
};
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
