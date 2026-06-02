import { GraphQLScalarType, Kind } from 'graphql';

function parseJsonLiteral(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.OBJECT: {
      const value: Record<string, any> = {};
      for (const field of ast.fields) {
        value[field.name.value] = parseJsonLiteral(field.value);
      }
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseJsonLiteral);
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

const createPassthroughScalar = (name: string) =>
  new GraphQLScalarType({
    name,
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => (ast.kind === Kind.STRING ? ast.value : null)
  });

export const DateScalar = createPassthroughScalar('Date');
export const TimeScalar = createPassthroughScalar('Time');
export const DateTimeScalar = createPassthroughScalar('DateTime');
export const JsonScalar = new GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => parseJsonLiteral(ast)
});