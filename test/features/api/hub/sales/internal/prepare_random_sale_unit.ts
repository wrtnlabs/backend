import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import { CartesianProduct } from "cagen";
import { Singleton, randint } from "tstl";
import typia from "typia";

import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

export const prepare_random_sale_unit = (
  input?: Partial<IHubSaleUnit.ICreate>,
): IHubSaleUnit.ICreate => {
  // PREPARE SWAGGER DOCUMENTS
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = toss.get();

  // PREPARE NUMBER OF CASES GENERATOR
  const candidateCountMatrix: number[] = ArrayUtil.repeat(randint(1, 3))(() =>
    randint(1, 4),
  );
  const cartesian: CartesianProduct = new CartesianProduct(
    ...candidateCountMatrix,
  );

  // DO GENERATE
  return {
    parent_id: null,
    contents: [
      {
        name: RandomGenerator.name(),
        lang_code: "en",
        original: true,
      },
    ],
    primary: true,
    required: true,
    host: {
      real: "https://api.tosspayments.com",
      dev: `http://localhost:30771`,
    },
    swagger,
    options: candidateCountMatrix.map((count) => ({
      name: RandomGenerator.name(randint(4, 8)),
      type: "select",
      variable: true,
      candidates: ArrayUtil.repeat(count)(() => ({
        name: RandomGenerator.name(randint(3, 12)),
      })),
    })),
    stocks: cartesian.map((indexes) => ({
      name: RandomGenerator.name(randint(4, 12)),
      prices: ArrayUtil.repeat(randint(1, 3))((i) => ({
        threshold: Math.pow(10, i + 2),
        fixed: Math.pow(10, i + 4) * randint(1, 10),
        variable: 100 - i * 10,
      })),
      choices: indexes
        .map((candidate, option) => ({
          option_index: option,
          candidate_index: candidate,
        }))
        .sort((a, b) =>
          a.option_index === b.option_index
            ? a.candidate_index - b.candidate_index
            : a.option_index - b.option_index,
        ),
    })),
    ...(input ?? {}),
  } as IHubSaleUnit.ICreate;
};

const toss = new Singleton(() =>
  typia.assert<
    SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument
  >(require("toss-payments-server-api/swagger.json")),
);
