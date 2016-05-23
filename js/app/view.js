define([
    'app/options',
    'bean',
    'app/views/DesktopPlayer',
    'app/visualizers/bars',
    'app/visualizers/circles',
    'app/visualizers/hexagons'
], function (
    Options,
    Bean,
    DesktopPlayer,
    bars,
    circles,
    hexagons
    ) {

    var View = {

        IdleTimer: 0,

        visualizers: {
            current: ''
        },

        visualizerContainer: document.getElementById('visualizer-container'),
        chooser: document.getElementById('chooser'),
        uiContainer: document.getElementById('ui-container'),
        ui: document.getElementById('ui'),
        searchBtn: document.getElementById('search-btn'),
        searchInput: document.getElementById('search-input'),
        randomColor: document.getElementById('random-color'),
        fullscreen: document.getElementById('fullscreen'),
        colorPickers: [
            document.getElementById('color-picker1'),
            document.getElementById('color-picker2'),
            document.getElementById('color-picker3')
        ],

        init: function() {
            DesktopPlayer.init();

            var body = document.body;
            Bean.on(this.chooser, 'change', _.bind(this.switchVisualizers, this));

            if (Options.loadFromSC) {
                Bean.on(this.searchBtn, 'click', _.bind(this.onSearch, this));
                Bean.on(this.searchInput, 'keyup', _.bind(function(e) {
                    if (e.keyCode === 13) {
                        this.onSearch();
                    }
                }, this));
            }

            var toggleUIFunc = _.bind(this.toggleUI, this);
            Bean.on(body, {
                'click': toggleUIFunc,
                'mousemove': toggleUIFunc,
                'keyup': toggleUIFunc
            });


            Bean.on(window, 'view.resetColors', _.bind(this.resetColors, this));

            this.visualizers[bars.name] = bars;
            this.visualizers[circles.name] = circles;
            this.visualizers[hexagons.name] = hexagons;

            this.switchVisualizers();
            this.setupFullscreen();
            this.setupColorEvents();
            this.setupResizeEvent();
        },

        setupColorEvents: function() {
            Bean.on(this.randomColor, 'click', _.bind(function() {
                var current = this.visualizers[this.visualizers.current];
                current.resetColors();
                current.setColors();
            }, this));

            var onColorChange = _.bind(function(elNum, color) {
                var currentVisualizer = this.visualizers[this.visualizers.current];
                color = hexToRgb(color);

                //Break hex color into rgb values.
                currentVisualizer['color' + elNum] = color;
                currentVisualizer.onColorChange();
            }, this);

            // Loop through colorpickers and attach change events
            for (var i = 0; i < this.colorPickers.length; i++) {
                var picker = this.colorPickers[i];

                Bean.on(picker, 'change', function(ev, index) {
                    var el = ev.currentTarget;
                    onColorChange(index + 1, el.value);
                }, i);
            }

        },

        setupResizeEvent: function() {
            var rtime = new Date(1, 1, 2000, 12,00,00);
            var timeout = false;
            var delta = 200;

            Bean.on(window, 'resize', _.throttle(function() {
                rtime = new Date();
                if (timeout === false) {
                    timeout = true;
                    setTimeout(resizeend, delta);
                }

                function resizeend() {
                    if (new Date() - rtime < delta) {
                        setTimeout(resizeend, delta);
                    } else {
                        timeout = false;
                        doneResizing();
                    }
                }

                function doneResizing () {
                    Bean.fire(window, 'visualizer.onResize');
                }
            }, 100));


        },

        setupFullscreen: function() {
            if (
                document.fullscreenEnabled ||
                    document.webkitFullscreenEnabled ||
                    document.mozFullScreenEnabled ||
                    document.msFullscreenEnabled
                ) {
                Bean.on(this.fullscreen, 'click', _.bind(function() {
                    toggleFullscreen(document.body);
                    var isFullscreen = getIsFullscreen();
                }, this));
            } else {
                this.fullscreen.style.display = 'none';
            }
        },

        switchVisualizers: function() {
            var visName = this.chooser.value;
            var current = this.visualizers.current;

            if (current) {
                this.visualizers[current].destroy();
            }
            this.visualizers[visName].visualizerSettings = this.visualizerSettings;
            this.visualizers[visName].run();
            this.visualizers.current = visName;
        },

        onSearch: function() {
            Bean.fire(window, 'model.search', this.searchInput.value);
        },

        toggleUI: _.throttle(function() {
            this.visualizerContainer.style.cursor = 'auto';
            this.ui.style.opacity = 1;

            if (Options.fadeUI) {
                clearInterval(this.IdleTimer);

                this.IdleTimer = setInterval(_.bind(function() {
                    this.ui.style.opacity = 0;
                    this.visualizerContainer.style.cursor = 'none';
                }, this), 2000);
            }

        }),

        resetColors: function(colors) {
            for (var i = 0; i < colors.length; i++) {
                // Needs to be hexcolor for some reason.
                var color = rgbToHex(colors[i]);
                var picker = this.colorPickers[i];

                picker.value = color;
            }
        }

    };

    return View;
});
