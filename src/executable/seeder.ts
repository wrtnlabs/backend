import { HubSetupWizard } from "../setup/HubSetupWizard";
import { StopWatch } from "../utils/StopWatch";

const main = async () => {
  await StopWatch.trace("Seed Data")(HubSetupWizard.seed);
};
main().catch((exp) => {
  console.error(exp);
  throw exp;
});
