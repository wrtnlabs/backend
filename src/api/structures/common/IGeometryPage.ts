import { tags } from "typia";

import { IPoint2D } from "./IPoint2D";

/**
 *  Geometry Page.
 *
 *  Collection of records with geometry information.
 *
 *  @template T Record type.
 *  @author Samchon
 */
export interface IGeometryPage<T> {
  /**
   *  Number of total records in the database.
   */
  total: number & tags.Type<"uint32">;

  /**
   *  The world size.
   */
  world: IPoint2D;

  /**
   *  The boundary of the current page.
   */
  boundary: IGeometryPage.IBoundary;

  /**
   *  List of records covered by the {@link boundary}.
   */
  data: T[];
}
export namespace IGeometryPage {
  /**
   *  Boundary info.
   */
  export interface IBoundary {
    /**
     *  The starting point of the boundary.
     */
    position: IPoint2D;

    /**
     *  The scale of the boundary.
     */
    scale: IPoint2D;
  }

  /**
   *  Request info.
   */
  export interface IRequest {
    /**
     *  Target boundary.
     */
    boundary: IBoundary;
  }
}
