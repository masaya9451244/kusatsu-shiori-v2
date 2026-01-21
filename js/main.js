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

// ========== グルメセクション機能 ==========

// グルメエリアタブ切り替え
function setupGourmetTabs() {
    const tabs = document.querySelectorAll('.gourmet-area-tab');
    const contents = document.querySelectorAll('.gourmet-area-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetArea = tab.dataset.area;

            // タブのアクティブ状態を更新
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // コンテンツの表示を切り替え
            contents.forEach(content => {
                if (content.dataset.area === targetArea) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });

            // ジャンルフィルターを「すべて」にリセット
            const allFilter = document.querySelector('.gourmet-genre-filter[data-genre="all"]');
            if (allFilter) {
                document.querySelectorAll('.gourmet-genre-filter').forEach(f => f.classList.remove('active'));
                allFilter.classList.add('active');
            }

            // 現在のエリアの全カードを表示
            const activeContent = document.querySelector('.gourmet-area-content.active');
            if (activeContent) {
                activeContent.querySelectorAll('.gourmet-card').forEach(card => {
                    card.classList.remove('hidden');
                });
            }
        });
    });
}

// グルメジャンルフィルター
function setupGourmetFilters() {
    const filters = document.querySelectorAll('.gourmet-genre-filter');

    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const targetGenre = filter.dataset.genre;

            // フィルターのアクティブ状態を更新
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            // 現在のエリアのカードをフィルタリング
            const activeContent = document.querySelector('.gourmet-area-content.active');
            if (!activeContent) return;

            const cards = activeContent.querySelectorAll('.gourmet-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const cardGenres = card.dataset.genre.split(' ');

                if (targetGenre === 'all' || cardGenres.includes(targetGenre)) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            // 該当なしメッセージの表示
            let noResultsMsg = activeContent.querySelector('.no-results-message');
            if (visibleCount === 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.innerHTML = `
                        <div class="no-results-icon">🍽️</div>
                        <p class="no-results-text">該当するお店がありません</p>
                    `;
                    activeContent.appendChild(noResultsMsg);
                }
                noResultsMsg.style.display = 'block';
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        });
    });
}

// グルメ写真スライダー
function setupGourmetSliders() {
    const sliders = document.querySelectorAll('.gourmet-card-slider');

    sliders.forEach(slider => {
        const images = slider.querySelectorAll('.slider-img');
        const dots = slider.querySelectorAll('.slider-dots .dot');
        let currentIndex = 0;
        let startX = 0;
        let isDragging = false;

        // ドットクリックで切り替え
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        // タッチ操作でスワイプ
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < images.length - 1) {
                    // 左スワイプ - 次へ
                    showSlide(currentIndex + 1);
                } else if (diff < 0 && currentIndex > 0) {
                    // 右スワイプ - 前へ
                    showSlide(currentIndex - 1);
                }
            }
        }, { passive: true });

        // マウス操作（PC用）
        slider.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
        });

        slider.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const diff = startX - e.clientX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < images.length - 1) {
                    showSlide(currentIndex + 1);
                } else if (diff < 0 && currentIndex > 0) {
                    showSlide(currentIndex - 1);
                }
            }
        });

        slider.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        function showSlide(index) {
            currentIndex = index;

            images.forEach((img, i) => {
                if (i === index) {
                    img.classList.add('active');
                } else {
                    img.classList.remove('active');
                }
            });

            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    });
}

// ========== 初期化処理 ==========
// DOMContentLoadedイベントリスナーに追加
document.addEventListener('DOMContentLoaded', () => {
    // 観光セクションの機能を初期化
    setupSightseeingTabs();
    setupScheduleToggles();
    setupModelCourses();
    setupTriviaAccordion();

    // グルメセクションの機能を初期化
    setupGourmetTabs();
    setupGourmetFilters();
    setupGourmetSliders();
});
