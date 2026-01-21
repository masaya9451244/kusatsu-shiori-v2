// ========== グローバル変数 ==========
let currentSlide = 0;
let slideInterval = null;

// ========== 初期化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // イベントリスナー設定
    setupEventListeners();

    // 内部リンク設定（日程→観光、日程→グルメなど）
    setupInternalLinks();

    // セクション表示監視（タブ方式では不要）
    setupIntersectionObserver();

    // ホテルヒーロー動画の全画面再生設定
    setupHeroVideo();
}

// ========== イベントリスナー ==========
function setupEventListeners() {
    // 選択画面ボタン
    document.getElementById('btn-first-time').addEventListener('click', startSurprise);
    document.getElementById('btn-revisit').addEventListener('click', skipToMain);

    // サプライズ演出ボタン
    document.getElementById('btn-next-step1').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-next-step2').addEventListener('click', () => goToStep(3));
    document.getElementById('btn-next-step3').addEventListener('click', () => goToStep(4));
    document.getElementById('btn-next-step4').addEventListener('click', () => goToStep(5));
    document.getElementById('btn-next-step5').addEventListener('click', () => goToStep(6));
    document.getElementById('btn-next-step6').addEventListener('click', () => goToStep(7));
    document.getElementById('btn-start-shiori').addEventListener('click', showMainContent);

    // 封筒クリック（iOS Safari対応でtouchendも追加）
    const envelope = document.getElementById('envelope');
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchend', (e) => {
        e.preventDefault();
        openEnvelope();
    });

    // スクラッチカード
    setupScratchCard();

    // スライドショーのドットクリック
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            goToSlide(parseInt(e.target.dataset.dot));
        });
    });

    // ナビゲーション
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavClick);
    });
}

// ========== 画面切り替え ==========
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToStep(stepNumber) {
    showScreen(`surprise-step${stepNumber}`);

    // 各ステップの初期化処理
    switch(stepNumber) {
        case 3:
            // スクラッチカード画面が表示された後にCanvasを初期化
            setTimeout(() => {
                initScratchCanvas();
            }, 100);
            break;
        case 4:
            typeWriter('hotel-teaser-text', 'そしてそして、\n宿泊する宿は！', 80, () => {
                showButton('btn-next-step4');
            });
            break;
        case 5:
            startSlideshow();
            break;
        case 6:
            createStars();
            break;
    }
}

// ========== サプライズ演出開始 ==========
function startSurprise() {
    showScreen('surprise-step1');

    // 紙吹雪開始
    startConfetti();

    // お祝いメッセージをタイプライター表示
    setTimeout(() => {
        typeWriter('birthday-text', '🎂 菜々穂さん、🎂\nお誕生日おめでとう！', 100, () => {
            showButton('btn-next-step1');
        });
    }, 500);
}

// ========== スキップしてメインへ ==========
function skipToMain() {
    showMainContent();
}

// ========== メインコンテンツ表示 ==========
function showMainContent() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    showScreen('main-content');

    // bodyにshiori-activeクラスを追加（ヘッダー表示用）
    document.body.classList.add('shiori-active');

    // セクションを順次表示
    setTimeout(() => {
        document.querySelectorAll('.section').forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('visible');
            }, index * 200);
        });
    }, 100);
}

// ========== タイプライター効果 ==========
function typeWriter(elementId, text, speed, callback) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += text.charAt(i);
            }
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }

    type();
}

// ========== ボタン表示 ==========
function showButton(buttonId) {
    const button = document.getElementById(buttonId);
    button.classList.remove('hidden');
    button.classList.add('show');
}

// ========== 紙吹雪 ==========
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#B96A55', '#F1D6D2', '#C6A07C', '#FFD700', '#FF69B4', '#87CEEB'];

    // 紙吹雪を生成
    for (let i = 0; i < 100; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach((c, i) => {
            c.y += c.speed;
            c.angle += c.spin;
            c.x += Math.sin(c.angle * Math.PI / 180) * 0.5;

            ctx.save();
            ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
            ctx.rotate(c.angle * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            ctx.restore();

            if (c.y > canvas.height) {
                confetti[i].y = -20;
                confetti[i].x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ========== 封筒演出 ==========
function openEnvelope() {
    const envelope = document.getElementById('envelope');
    const wrapper = document.querySelector('.envelope-wrapper');

    if (!envelope.classList.contains('opened')) {
        // 封筒のフタを開く
        envelope.classList.add('opened');

        // 手紙を出すためにwrapperにもクラス追加
        wrapper.classList.add('opened');

        // 手紙が出てきた後にボタン表示
        setTimeout(() => {
            showButton('btn-next-step2');
        }, 1500);
    }
}

// ========== スクラッチカード ==========
let scratchCardInitialized = false;

function initScratchCanvas() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    // コンテナが表示されている場合のみ初期化
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        return;
    }

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // スクラッチ面をリセット
    canvas.style.display = 'block';
    container.classList.remove('revealed');

    // グレーのスクラッチ面を描画
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // キラキラ模様を追加
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = '#D8D8D8';
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 3 + 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // 「こすってね」テキストを追加
    ctx.fillStyle = '#999';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ここをこすってね！', canvas.width / 2, canvas.height / 2);

    scratchCardInitialized = true;
}

function setupScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let scratchedPixels = 0;
    let totalPixels = 0;

    // キャンバスサイズ設定
    function resizeCanvas() {
        const container = canvas.parentElement;

        // コンテナが非表示の場合はスキップ
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            return;
        }

        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // グレーのスクラッチ面を描画
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // キラキラ模様を追加
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = '#D8D8D8';
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 3 + 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        totalPixels = canvas.width * canvas.height;
    }

    // 初期化は画面表示時に行うため、ここでは呼ばない
    // resizeCanvas();

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        return { x, y };
    }

    function scratch(e) {
        if (!isDrawing) return;

        const pos = getPos(e);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // キラキラエフェクト
        createSparkle(pos.x, pos.y);

        checkScratchProgress();
    }

    function checkScratchProgress() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparentPixels = 0;

        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) {
                transparentPixels++;
            }
        }

        const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;

        if (percentage > 70) {
            revealDestination();
        }
    }

    function revealDestination() {
        const container = document.querySelector('.scratch-container');
        if (!container.classList.contains('revealed')) {
            container.classList.add('revealed');
            canvas.style.display = 'none';

            // 湯気エフェクト
            createSteam();

            setTimeout(() => {
                showButton('btn-next-step3');
            }, 1000);
        }
    }

    // イベントリスナー
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        scratch(e);
    });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        scratch(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        scratch(e);
    });
    canvas.addEventListener('touchend', () => isDrawing = false);
}

// ========== キラキラエフェクト ==========
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
        background: gold;
        border-radius: 50%;
        pointer-events: none;
        animation: sparkle 0.5s ease-out forwards;
        z-index: 100;
    `;

    document.querySelector('.scratch-container').appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 500);
}

// ========== 湯気エフェクト ==========
function createSteam() {
    const container = document.getElementById('steam-container');

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const steam = document.createElement('div');
            steam.className = 'steam';
            steam.style.left = `${Math.random() * 100}%`;
            steam.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(steam);
        }, i * 200);
    }
}

// ========== スライドショー ==========
function startSlideshow() {
    currentSlide = 0;
    updateSlide();

    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % 6;
        updateSlide();
    }, 3000);
}

function updateSlide() {
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
    });
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('active');
    });

    document.querySelector(`.slide[data-slide="${currentSlide}"]`).classList.add('active');
    document.querySelector(`.dot[data-dot="${currentSlide}"]`).classList.add('active');
}

function goToSlide(index) {
    currentSlide = index;
    updateSlide();

    // タイマーリセット
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % 6;
            updateSlide();
        }, 3000);
    }
}

// ========== 星エフェクト ==========
function createStars() {
    const container = document.getElementById('stars-container');
    container.innerHTML = '';

    for (let i = 0; i < 20; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '✨';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 1}s`;
        star.style.fontSize = `${Math.random() * 1 + 0.8}rem`;
        container.appendChild(star);
    }
}

// ========== ナビゲーション（タブ切り替え） ==========
function handleNavClick(e) {
    e.preventDefault();

    // アクティブ状態更新（ナビ）
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.target.classList.add('active');

    // タブコンテンツ切り替え
    const targetId = e.target.getAttribute('href').substring(1);
    switchTab(targetId);
}

function switchTab(tabId) {
    // 全タブを非表示
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 該当タブを表示
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'instant' });

        // 観光タブの場合、地図を再調整
        if (tabId === 'sightseeing') {
            setTimeout(() => {
                // 現在アクティブなエリアの地図を再調整
                const activeArea = document.querySelector('.area-content.active');
                if (activeArea) {
                    const areaId = activeArea.id.replace('area-', '');
                    refreshMapSize(areaId);
                }
            }, 200);
        }
    }
}

// ========== 日程内のリンク対応 ==========
function setupInternalLinks() {
    document.querySelectorAll('.event-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // ナビのアクティブ状態を更新
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === targetId) {
                    item.classList.add('active');
                }
            });

            // タブ切り替え
            switchTab(targetId);
        });
    });
}

// ========== スクロール監視（不要だが残す） ==========
function setupIntersectionObserver() {
    // タブ切り替え方式では使用しないが、互換性のため残す
}

// ========== ホテルヒーロー動画 全画面再生 ==========
function setupHeroVideo() {
    const heroVideo = document.querySelector('.hotel-hero-video');
    const heroContainer = document.querySelector('.hotel-hero');

    if (!heroVideo || !heroContainer) return;

    // iOS Safari検出
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // 動画の読み込みを確実にする
    heroVideo.load();

    // iOSでは自動再生が制限されるため、最初のタッチで再生開始
    if (isIOS) {
        let hasInteracted = false;
        const startPlayback = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                heroVideo.play().catch(() => {});
            }
        };
        document.addEventListener('touchstart', startPlayback, { once: true, passive: true });
    }

    // タップで全画面再生
    heroContainer.addEventListener('click', (e) => {
        e.preventDefault();

        // 音声ON、ループOFFで全画面再生
        heroVideo.muted = false;
        heroVideo.loop = false;
        heroVideo.currentTime = 0;

        // iOS Safari用の全画面再生
        if (isIOS && heroVideo.webkitEnterFullscreen) {
            heroVideo.play().then(() => {
                heroVideo.webkitEnterFullscreen();
            }).catch((err) => {
                console.log('iOS fullscreen error:', err);
                // フォールバック: 通常再生
                heroVideo.play();
            });
        }
        // 標準の全画面API
        else if (heroVideo.requestFullscreen) {
            heroVideo.requestFullscreen().then(() => {
                heroVideo.play();
            }).catch(() => {
                heroVideo.play();
            });
        }
        // Webkit全画面
        else if (heroVideo.webkitRequestFullscreen) {
            heroVideo.webkitRequestFullscreen();
            heroVideo.play();
        }
        // フォールバック
        else {
            heroVideo.play();
        }
    });

    // 全画面終了時にミュート・ループに戻す
    const resetToLoop = () => {
        heroVideo.muted = true;
        heroVideo.loop = true;
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
    };

    heroVideo.addEventListener('ended', resetToLoop);

    // iOS Safari用イベント
    heroVideo.addEventListener('webkitendfullscreen', resetToLoop);

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            resetToLoop();
        }
    });

    document.addEventListener('webkitfullscreenchange', () => {
        if (!document.webkitFullscreenElement) {
            resetToLoop();
        }
    });

    // 動画が一時停止されたら再開（iOS対策）
    heroVideo.addEventListener('pause', () => {
        if (heroVideo.muted && heroVideo.loop) {
            setTimeout(() => {
                heroVideo.play().catch(() => {});
            }, 100);
        }
    });
}

// ========== CSS動的追加 ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(2);
        }
    }
`;
document.head.appendChild(style);

// ========== 観光セクション - エリア別タブ切替 ==========
function setupSightseeingTabs() {
    // エリアタブ
    const areaTabs = document.querySelectorAll('.area-tab');
    const areaContents = document.querySelectorAll('.area-content');

    areaTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetArea = tab.dataset.area;

            // タブのアクティブ状態を更新
            areaTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // コンテンツの表示切り替え
            areaContents.forEach(content => {
                content.classList.remove('active');
            });

            const targetContent = document.getElementById(`area-${targetArea}`);
            if (targetContent) {
                targetContent.classList.add('active');

                // 地図の初期化（表示時に行う）
                initMapIfNeeded(targetArea);
                // 既存の地図のサイズを再調整
                refreshMapSize(targetArea);
            }
        });
    });

    // サブナビゲーション（モデルコース、豆知識）
    const subNavBtns = document.querySelectorAll('.subnav-btn');
    subNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetArea = btn.dataset.target;

            // タブのアクティブ状態をクリア
            areaTabs.forEach(t => t.classList.remove('active'));

            // サブナビのアクティブ状態を更新
            subNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // コンテンツの表示切り替え
            areaContents.forEach(content => {
                content.classList.remove('active');
            });

            const targetContent = document.getElementById(`area-${targetArea}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // デフォルトで湯畑エリアを表示（遅延して確実に初期化）
    setTimeout(() => {
        const defaultTab = document.querySelector('.area-tab[data-area="yubatake"]');
        if (defaultTab) {
            defaultTab.click();
            // 湯畑の地図を追加で再調整
            setTimeout(() => refreshMapSize('yubatake'), 200);
            setTimeout(() => refreshMapSize('yubatake'), 500);
            setTimeout(() => refreshMapSize('yubatake'), 1000);
        }
    }, 100);
}

// ========== フィルタチップ ==========
function setupFilterChips() {
    document.querySelectorAll('.filter-chips-container').forEach(container => {
        const chips = container.querySelectorAll('.filter-chip');
        const parentContent = container.closest('.area-content');
        const spotCards = parentContent ? parentContent.querySelectorAll('.spot-card') : [];

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const targetSpot = chip.dataset.spot;

                // チップのアクティブ状態を更新
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                // カードのフィルタリング
                spotCards.forEach(card => {
                    if (targetSpot === 'all') {
                        card.style.display = 'block';
                        card.classList.remove('highlighted');
                    } else {
                        if (card.dataset.spotId === targetSpot) {
                            card.style.display = 'block';
                            card.classList.add('highlighted');
                            // カードまでスクロール
                            setTimeout(() => {
                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
    });
}

// ========== 開催時間トグル ==========
function setupScheduleToggles() {
    document.querySelectorAll('.schedule-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const scheduleInfo = toggle.nextElementSibling;

            toggle.classList.toggle('open');
            scheduleInfo.classList.toggle('open');

            // ボタンテキストの切り替え
            if (toggle.classList.contains('open')) {
                toggle.textContent = '🕐 開催時間を閉じる';
            } else {
                toggle.textContent = '🕐 開催時間を見る';
            }
        });
    });
}

// ========== モデルコース詳細表示 ==========
function setupModelCourses() {
    const courseCards = document.querySelectorAll('.course-cards');
    const courseDetails = document.querySelectorAll('.course-detail');
    const backBtns = document.querySelectorAll('.course-back-btn');

    // 詳細を見るボタン
    document.querySelectorAll('.course-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const courseCard = btn.closest('.course-card');
            const courseId = courseCard.dataset.course;

            // カード一覧を非表示
            courseCards.forEach(cards => {
                cards.style.display = 'none';
            });

            // 該当コースの詳細を表示
            const targetDetail = document.getElementById(`course-${courseId}`);
            if (targetDetail) {
                targetDetail.classList.add('active');
            }
        });
    });

    // 戻るボタン
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 詳細を非表示
            courseDetails.forEach(detail => {
                detail.classList.remove('active');
            });

            // カード一覧を表示
            courseCards.forEach(cards => {
                cards.style.display = 'flex';
            });
        });
    });
}

// ========== 豆知識アコーディオン ==========
function setupTriviaAccordion() {
    document.querySelectorAll('.trivia-header').forEach(header => {
        header.addEventListener('click', () => {
            const triviaItem = header.closest('.trivia-item');

            // 他のアイテムを閉じる（オプション：1つだけ開く場合）
            // document.querySelectorAll('.trivia-item').forEach(item => {
            //     if (item !== triviaItem) {
            //         item.classList.remove('open');
            //     }
            // });

            triviaItem.classList.toggle('open');
        });
    });
}

// ========== Leaflet.js 地図初期化 ==========
let maps = {};

// 各エリアのスポット座標データ
const spotCoordinates = {
    yubatake: {
        center: [36.62175, 138.59585],
        zoom: 17,
        spots: [
            { id: 'yubatake-main', name: '湯畑', lat: 36.62175, lng: 138.59585 },
            { id: 'yubatake-kumiwaku', name: '御汲み上げの湯枠', lat: 36.62195, lng: 138.59565 },
            { id: 'yubatake-yutoi', name: '湯樋', lat: 36.62185, lng: 138.59605 },
            { id: 'yubatake-yukemuri', name: '湯けむり亭', lat: 36.62145, lng: 138.59545 },
            { id: 'yubatake-yutaki', name: '湯滝', lat: 36.62125, lng: 138.59625 },
            { id: 'yubatake-tourou', name: '湯滝の灯篭', lat: 36.62115, lng: 138.59615 },
            { id: 'yubatake-hi', name: '御汲上げの碑', lat: 36.62215, lng: 138.59575 },
            { id: 'yubatake-yuji', name: '湯路広場', lat: 36.62135, lng: 138.59515 },
            { id: 'yubatake-netsunoyu', name: '熱乃湯', lat: 36.62225, lng: 138.59535 },
            { id: 'yubatake-mandarado', name: 'まんだら堂', lat: 36.62245, lng: 138.59505 },
            { id: 'yubatake-tomoeya', name: 'ともえや', lat: 36.62235, lng: 138.59485 },
            { id: 'yubatake-osayu', name: 'おさ湯', lat: 36.62265, lng: 138.59525 },
            { id: 'yubatake-illumi', name: 'イルミネーション', lat: 36.62165, lng: 138.59575 },
            { id: 'yubatake-onsenmon', name: '温泉門', lat: 36.62255, lng: 138.59445 },
            { id: 'yubatake-ichii', name: '一井お土産センター', lat: 36.62205, lng: 138.59515 }
        ]
    },
    sainokawara: {
        center: [36.6235, 138.5915],
        zoom: 16,
        spots: [
            { id: 'sainokawara-dori', name: '西の河原通り', lat: 36.6225, lng: 138.5940 },
            { id: 'sainokawara-park', name: '西の河原公園', lat: 36.6245, lng: 138.5890 },
            { id: 'sainokawara-glass', name: '草津ガラス蔵', lat: 36.6228, lng: 138.5937 }
        ]
    },
    urakusatsu: {
        center: [36.6200, 138.5970],
        zoom: 17,
        spots: [
            { id: 'urakusatsu-jizo', name: '裏草津 地蔵', lat: 36.6198, lng: 138.5948 },
            { id: 'urakusatsu-kaoyu', name: '顔湯', lat: 36.6199, lng: 138.5949 },
            { id: 'urakusatsu-ashiyu', name: '足湯', lat: 36.6197, lng: 138.5947 },
            { id: 'urakusatsu-tearai', name: '手洗乃湯', lat: 36.6200, lng: 138.5950 },
            { id: 'urakusatsu-manga', name: '漫画堂', lat: 36.6195, lng: 138.5952 },
            { id: 'urakusatsu-hyakunen', name: '百年石別邸', lat: 36.6193, lng: 138.5955 },
            { id: 'urakusatsu-takadai', name: '高台広場', lat: 36.6192, lng: 138.5958 }
        ]
    },
    shuhen: {
        center: [36.5500, 138.8500],
        zoom: 10,
        spots: [
            { id: 'shuhen-meiken', name: '世界の名犬牧場', lat: 36.4550, lng: 139.0920 }
        ]
    }
};

function initMapIfNeeded(areaId) {
    const mapContainer = document.getElementById(`map-${areaId}`);
    if (!mapContainer || maps[areaId]) return;

    const areaData = spotCoordinates[areaId];
    if (!areaData) return;

    // コンテナサイズが確定するまで待機
    if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
        setTimeout(() => initMapIfNeeded(areaId), 100);
        return;
    }

    // Leaflet地図を初期化
    const map = L.map(`map-${areaId}`, {
        center: areaData.center,
        zoom: areaData.zoom,
        scrollWheelZoom: true,
        zoomControl: true
    });

    // CartoDB Voyagerタイル（シンプルでモダンな地図）
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // カスタムアイコン
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #B96A55; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    // スポットのピンを追加
    areaData.spots.forEach(spot => {
        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${spot.name}</b>`)
            .on('click', () => {
                // 対応するカードまでスクロール
                const card = document.querySelector(`[data-spot-id="${spot.id}"]`);
                if (card) {
                    card.classList.add('highlighted');
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                    setTimeout(() => {
                        card.classList.remove('highlighted');
                    }, 2000);
                }
            });
    });

    maps[areaId] = map;

    // 地図のサイズ調整を複数回実行
    const refreshMap = () => {
        map.invalidateSize();
        map.setView(areaData.center, areaData.zoom);
    };

    setTimeout(refreshMap, 100);
    setTimeout(refreshMap, 300);
    setTimeout(refreshMap, 600);
    setTimeout(refreshMap, 1000);

    // ResizeObserverでコンテナサイズ変更を監視
    const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
    });
    resizeObserver.observe(mapContainer);
}

// 既存の地図のサイズを再調整
function refreshMapSize(areaId) {
    if (maps[areaId]) {
        const areaData = spotCoordinates[areaId];
        maps[areaId].invalidateSize();
        if (areaData) {
            maps[areaId].setView(areaData.center, areaData.zoom);
        }
    }
}

// ========== 初期化処理を更新 ==========
// DOMContentLoadedイベントリスナーに追加
document.addEventListener('DOMContentLoaded', () => {
    // 観光セクションの機能を初期化
    setupSightseeingTabs();
    setupFilterChips();
    setupScheduleToggles();
    setupModelCourses();
    setupTriviaAccordion();
});
