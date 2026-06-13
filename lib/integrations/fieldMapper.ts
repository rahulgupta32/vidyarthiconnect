export class FieldMapper {
  /**
   * Map external record fields using configured database field mappings or standard rules.
   */
  public static mapFields(
    externalPayload: any,
    mappings: Array<{ externalFieldName: string; internalFieldName: string; transformRule?: string | null }>
  ): any {
    const result: any = {};

    for (const mapping of mappings) {
      const value = this.getValueByPath(externalPayload, mapping.externalFieldName);
      if (value !== undefined) {
        let transformedValue = value;
        
        if (mapping.transformRule === "uppercase" && typeof value === "string") {
          transformedValue = value.toUpperCase();
        } else if (mapping.transformRule === "lowercase" && typeof value === "string") {
          transformedValue = value.toLowerCase();
        } else if (mapping.transformRule === "number") {
          transformedValue = Number(value);
        } else if (mapping.transformRule === "boolean") {
          transformedValue = Boolean(value);
        }

        result[mapping.internalFieldName] = transformedValue;
      }
    }

    return result;
  }

  private static getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }
}
