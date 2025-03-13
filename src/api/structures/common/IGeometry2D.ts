import { IPoint2D } from "./IPoint2D";

export interface IGeometry2D {
  position: IPoint2D;
  scale: IPoint2D;
  depth: number;
}
