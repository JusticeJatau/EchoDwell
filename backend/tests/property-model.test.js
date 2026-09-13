import test from "node:test";
import assert from "node:assert/strict";
import Property from "../src/models/Property.js";
test("property model declares a geospatial index for nearby search", () => { const indexes = Property.schema.indexes(); assert.ok(indexes.some(([fields]) => fields["location.geo"] === "2dsphere")); });
test("compound units preserve total and available counts", () => { const property = new Property({ title: "Test compound", slug: "test-compound", description: "A suitable property description", owner: "64f000000000000000000001", organization: "64f000000000000000000002", propertyType: "compound", units: [{ name: "Self-contained", type: "self-contained", totalUnits: 5, availableUnits: 4, rentAmount: 250000 }] }); assert.equal(property.units[0].totalUnits, 5); assert.equal(property.units[0].availableUnits, 4); });
