import { ArrayUtil } from "@nestia/e2e";

import { IGeometryPage } from "../api/structures/common/IGeometryPage";
import { IPoint2D } from "../api/structures/common/IPoint2D";

export namespace GeometryPaginationUtil {
  export interface Transformer<
    Input extends RawBase,
    Output extends OutputBase,
  > {
    (records: Input): Output | Promise<Output>;
  }
  export interface IProps<
    Where extends object,
    OrderBy extends object,
    Payload extends object,
    Raw extends RawBase,
    Output extends OutputBase,
  > {
    schema: {
      findMany(
        input: Payload & {
          where?: Where;
        },
      ): Promise<Raw[]>;
      aggregate(p: AggregateRequest<Where>): Promise<AggregateOutput>;
    };
    payload: Payload;
    transform: Transformer<Raw, Output>;
  }
  export namespace IProps {
    export type DeduceWhere<T extends IProps<any, any, any, any, any>> =
      T extends IProps<infer U, any, any, any, any> ? U : never;
    export type DeduceOrderBy<T extends IProps<any, any, any, any, any>> =
      T extends IProps<any, infer U, any, any, any> ? U : never;
    export type DeducePayload<T extends IProps<any, any, any, any, any>> =
      T extends IProps<any, any, infer U, any, any> ? U : never;
    export type DeduceRaw<T extends IProps<any, any, any, any, any>> =
      T extends IProps<any, any, any, infer U, any> ? U : never;
    export type DeduceOutput<T extends IProps<any, any, any, any, any>> =
      T extends IProps<any, any, any, any, infer U> ? U : never;
  }

  export const paginate =
    <Props extends IProps<any, any, any, any, any>>(props: Props) =>
    (where: IProps.DeduceWhere<Props>) =>
    async (
      input: IGeometryPage.IRequest,
    ): Promise<IGeometryPage<IProps.DeduceOutput<Props>>> => {
      // GET THE WORLD SIZE
      const agg: AggregateOutput = await props.schema.aggregate({
        where,
        _max: {
          edge_x: true,
          edge_y: true,
        },
        _count: {
          id: true,
        },
      });
      const world: IPoint2D =
        agg._max.edge_x === null || agg._max.edge_y === null
          ? { x: 0, y: 0 }
          : {
              x: agg._max.edge_x,
              y: agg._max.edge_y,
            };
      if (agg._max.edge_x === null || agg._max.edge_y === null)
        return {
          total: 0,
          data: [],
          world,
          boundary: input.boundary,
        };

      // GET THE DATA
      const data: IProps.DeduceRaw<Props>[] = await props.schema.findMany({
        ...props.payload,
        where: {
          ...where,
          position_x: {
            gte: input.boundary.position.x,
          },
          position_y: {
            gte: input.boundary.position.y,
          },
          edge_x: {
            lte: input.boundary.position.x + input.boundary.scale.x,
          },
          edge_y: {
            lte: input.boundary.position.y + input.boundary.scale.y,
          },
        },
      });
      return {
        total: agg._count.id,
        world,
        boundary: input.boundary,
        data: await ArrayUtil.asyncMap(data)(props.transform),
      };
    };
}

interface RawBase {
  id: string;
  position_x: number;
  position_y: number;
  scale_x: number;
  scale_y: number;
  edge_x: number;
  edge_y: number;
}
interface OutputBase {
  position: IPoint2D;
  scale: IPoint2D;
}
interface AggregateRequest<Where extends object> {
  where: Where;
  _max: {
    edge_x: true;
    edge_y: true;
  };
  _count: {
    id: true;
  };
}
interface AggregateOutput {
  _count: {
    id: number;
  };
  _max: {
    edge_x: number | null;
    edge_y: number | null;
  };
}
