define(['app/options', 'bean', 'app/chromecast/receiver/player', 'app/chromecast/receiver/queue'], function (Options, Bean, Player, Queue) {
    var Base = {
        visualizer: document.getElementById('visualizer'),

        run: function() {
            this.clear();

            this.init();

            var fps = 60;
            if (this.fps) {
                fps = this.fps;
            }

            this.AnimationTimer = setInterval(_.bind(this.getData, this), 50 + (60 - this.fps));
        },

        clear: function() {
            var styleSheet = document.getElementById('visualizer-css');
            if (styleSheet) {
                document.head.removeChild(styleSheet);
            }
            this.visualizer.innerHTML = '';
        },

        getData: function() {
            if (Player.isPlaying) {

                //Get the data packet for the currentTime of the song
                var data = Queue.audiodata[Player.audio.currentTime];

                if (this.onSpectrum) {
                    this.onSpectrum(data);
                }

                if (this.onWaveform) {
                    this.onWaveform(data);
                }
            }
        },

        destroy: function() {
            clearInterval(this.AnimationTimer);

            if (this.onDestroy) {
                this.onDestroy();
            }
        }
    };

    return Base;
});