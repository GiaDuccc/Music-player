const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

// console.log(randomBtn)

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
          name: "That's so true",
          singer: "Gracie Abrams",
          path: "./music/song1.mp3",
          image: "./image/singer1.jpg",
        },
        {
          name: "Shape of You",
          singer: "REd Sheeran",
          path: "./music/song2.mp3",
          image: "./image/singer2.jpg",
        },
        {
          name: "STAY",
          singer: "The Kid LAROI(with Justin Bieber)",
          path: "./music/song3.mp3",
          image: "./image/singer3.jpg",
        },
        {
          name: "Somebody That I Used to Know",
          singer: " Gotye, Kimbra",
          path: "./music/song4.mp3",
          image: "./image/singer4.jpg",
        },
        {
          name: "BIRDS OF A FEATHER",
          singer: "Billie Eilish",
          path: "./music/song5.mp3",
          image: "./image/singer5.jpg",
        },
        {
          name: "TETVOVEN",
          singer: "Werxdie x Andree Right Hand",
          path: "./music/song6.mp3",
          image: "./image/singer6.jpg",
        },
        {
          name: "Đánh đổi",
          singer: "Obito",
          path: "./music/song7.mp3",
          image: "./image/singer7.jpg",
        }
    ],

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${ index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    hi: audio.duration,
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng (animate API)
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();



        // Xử lí phóng to hoặc thu nhỏ
        document.onscroll = function (){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            
            cd.style.width = newCdWidth > 0 ?newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //  Xủ lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying){
                audio.pause();
            }
            else {
                audio.play();
            }
        }
        // khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
        }

        // Khi random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
            
        }

        // Xử lý khi repeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
            
        }

        // Xử lý khi click vào thì bật bài hát
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')
            ) {
                // xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = songNode.dataset.index;
                    _this.loadCurrentSong();
                    $('.song.active').classList.remove('active');
                    songNode.classList.add('active');
                    // _this.render();
                    audio.play();
                }
                // Xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
            }
        }

        //  Xử lý next song khi audio ended
        audio.onended = function (){
            if (_this.isRepeat){
                _this.playRepeat();
            }
            else if (_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 100);
        console.log("thanhf cong")
    },

    // Load bài nhạc đầu tiên, khi thay đổi
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    // Xử lý next bài
    nextSong: function() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.scrollToActiveSong();
        this.render();
    },
    // Xử lí khi prev bài
    prevSong: function() {
        this.currentIndex == 0 ? this.currentIndex = this.songs.length - 1:  this.currentIndex--;
       
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();

    },
    //  Xử lí khi random bài
    playRandomSong: function (){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();

    },

    // Xử lí khi repeat
    playRepeat: function(){
        audio.currentTime = 0;
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();
        // Lắng nghe / Xử lý các sự kiện (DOM event)
        this.handleEvents();
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();
        // Render playlist
        this.render();
        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }    
}

app.start();



