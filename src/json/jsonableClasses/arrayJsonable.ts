import { WeightedItemFeeder } from "../../common/weightedItemFeeder.js";
import {
  type DocumentContent,
  type DocumentContext,
  stampDocumentContent,
} from "../../document/index.js";
import { AbstractJsonable } from "../abstractJsonable.js";
import type { JsonableValue } from "../jsonableTypes.js";
import type { JsonValue } from "../jsonTypes.js";
import { transformJsonableIntoJsonValue } from "../stringifyJsonable.js";

export class ArrayJsonable extends AbstractJsonable {
  public readonly type = "array" as const;
  private readonly weightedItemFeeder: WeightedItemFeeder<JsonableValue>;

  constructor(
    items: readonly JsonableValue[],
    private readonly lengthContent: DocumentContent,
    probability: number | undefined,
    weight: number | undefined,
  ) {
    super(probability, weight);
    const weightedItemFeeder = new WeightedItemFeeder<JsonableValue>();
    items.forEach((item) => {
      if (item instanceof AbstractJsonable) {
        weightedItemFeeder.addItem(item, item.weight);
      } else {
        weightedItemFeeder.addItem(item);
      }
    });
    this.weightedItemFeeder = weightedItemFeeder;
  }

  protected toJSONImpl(
    keyOrIndex: string | number,
    context: DocumentContext,
  ): JsonValue[] | undefined {
    const jsonValues: JsonValue[] = [];
    const length = Number.parseInt(
      stampDocumentContent(this.lengthContent, context),
    );
    if (!Number.isNaN(length) && length > 0) {
      for (let i = 0; i < length; i++) {
        const item = this.weightedItemFeeder.getItem();
        if (item !== undefined) {
          const jsonValue = transformJsonableIntoJsonValue(item, i, context);
          if (jsonValue !== undefined) {
            jsonValues.push(jsonValue);
          }
        }
      }
    }
    return jsonValues;
  }
}
