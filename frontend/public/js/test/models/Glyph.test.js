import Glyph from "models/Glyph";

var glyph = new Glyph();

beforeAll(() =>
{
    glyph.onCreate();
});

test('Confidence is between 0 and 1', function ()
{
    glyph.changeClass("");
    glyph.renameGlyph("");
    var confidence = glyph.get("confidence");
    expect(confidence).toBeGreaterThanOrEqual(0) &&
      confidence.toBeLessThanOrEqual(1);
});

test('Reset attributes after unclassifying', function ()
{
    glyph.unclassify();
    expect(glyph.get("confidence")).toBe(0);
    expect(glyph.get("class_name")).toMatch("UNCLASSIFIED");
    expect(glyph.get("id_state_manual")).toBe(false);
});
