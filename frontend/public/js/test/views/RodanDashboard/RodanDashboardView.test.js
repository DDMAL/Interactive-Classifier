import RodanDashboardView from 'views/RodanDashboard/RodanDashboardView';
var Backbone = require('backbone');

var dashboard = new RodanDashboardView({
    model: new Backbone.Model({
        previewImage: undefined,
        glyphDictionary: {},
        classNames: [],
        trainingGlyphs: {}
    })
});

beforeAll(() =>
{
    dashboard.initialize();
});

describe('Check glyph counts', function ()
{
    it('greater than or equal zero', function ()
    {
        console.log(dashboard.classifierCount, dashboard.pageCount, dashboard.selectedCount);
        expect(dashboard.classifierCount).toBeGreaterThanOrEqual(0);
        expect(dashboard.pageCount).toBeGreaterThanOrEqual(0);
        expect(dashboard.selectedCount).toBeGreaterThanOrEqual(0);
    });
});
