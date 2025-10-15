// ==============================
//  ✅ الجاليري (الصور + السلايدر + المودال)
// ==============================
  const container = document.querySelector('.main-image-container');
  const thumbnails = [...document.querySelectorAll('.thumbnail-container img')];
  const thumbContainer = document.querySelector('.thumbnail-container');
  const mainImg = document.getElementById('mainImage');
  let currentIndex = 0;
  const scrollAmount = 240;

  function applyImageStyle(img) {
    Object.assign(img.style, {
      objectFit: 'contain',
      backgroundColor: 'black',
      width: '100%',
      height: '100%'
    });
  }

  function changeImage(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    mainImg.src = thumbnails[index].src;
    applyImageStyle(mainImg);
    thumbnails.forEach(img =>
      img.classList.toggle('active-thumb', img === thumbnails[index])
    );
    scrollThumbnailIntoView(index);
  }

  function scrollThumbnailIntoView(index) {
    const thumb = thumbnails[index];
    const cRect = thumbContainer.getBoundingClientRect();
    const tRect = thumb.getBoundingClientRect();
    const isRTL = getComputedStyle(thumbContainer).direction === 'rtl';

    const offset = tRect.left < cRect.left
      ? tRect.left - cRect.left - 10
      : tRect.right > cRect.right
        ? tRect.right - cRect.right + 10
        : 0;

    thumbContainer.scrollLeft += isRTL ? offset : -offset;
  }

  // ✅ أزرار السلايدر
  document.getElementById('thumbsRight')?.addEventListener('click', () => thumbContainer.scrollLeft += scrollAmount);
  document.getElementById('thumbsLeft')?.addEventListener('click', () => thumbContainer.scrollLeft -= scrollAmount);

  document.getElementById('mainImageRightArrow')?.addEventListener('click', () =>
    changeImage((currentIndex - 1 + thumbnails.length) % thumbnails.length)
  );

  document.getElementById('mainImageLeftArrow')?.addEventListener('click', () =>
    changeImage((currentIndex + 1) % thumbnails.length)
  );

  thumbnails.forEach((img, i) => img.addEventListener('click', () => changeImage(i)));

  changeImage(0);

  // ==============================
  //  ✅ المودال (تكبير الصورة)
  // ==============================
  function createModal() {
    if (document.getElementById("imageModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="imageModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImage" />
        <span class="arrow left" onclick="navigateModal('prev')"></span>
        <span class="arrow right" onclick="navigateModal('next')"></span>
      </div>
    `);
  }
  createModal();

  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  window.openModal = function (index) {
    modal.style.display = "flex";
    modalImage.src = thumbnails[index].src;
    applyImageStyle(modalImage);
    currentIndex = index;
  };

  window.closeModal = function () {
    modal.style.display = "none";
  };

  window.navigateModal = function (direction) {
    currentIndex = direction === "next"
      ? (currentIndex + 1) % thumbnails.length
      : (currentIndex - 1 + thumbnails.length) % thumbnails.length;

    modalImage.src = thumbnails[currentIndex].src;
    applyImageStyle(modalImage);
  };

// ===================================================
// ✅ تغيير نصوص الأزرار
// ===================================================
const buyBtn = document.querySelector(".buy-button");
if (buyBtn) buyBtn.textContent = "اطلب الآن";

const cartBtn = document.querySelector(".add-to-cart");
if (cartBtn) cartBtn.textContent = "أضف للعربة";

// ✅ تغيير نصوص التابات
const textMap = {
  "الوصف": "التفاصيل",
  "المميزات": "المزايا",
  "المواصفات": "الخصائص الفنية",
  "الرسم البياني للسعر": "تحليل الأسعار",
  "تقييم العملاء": "آراء المستخدمين",
  "فيديو": "مشاهدة الفيديو"
};

document.querySelectorAll(".tab-buttons button").forEach(btn => {
  const oldText = btn.textContent.trim();
  if (textMap[oldText]) {
    btn.textContent = textMap[oldText];
  }
});

// ==============================
// ✅ إضافة نجوم التقييم
// ==============================
function renderStarsFromValue() {
  const ratingValueEl = document.getElementById("ratingValue");
  const starsContainer = document.getElementById("stars");
  if (!ratingValueEl || !starsContainer) return;

  let rating = parseFloat(ratingValueEl.textContent);
  let fullStars = Math.floor(rating);
  let hasHalf = (rating % 1 !== 0) ? 1 : 0;
  let emptyStars = 5 - fullStars - hasHalf;

  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<span class="star">★</span>`;
  }

  if (hasHalf) {
    starsHTML += `<span class="star half">★</span>`;
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<span class="star empty">★</span>`;
  }

  starsContainer.innerHTML = starsHTML;
}

// ✅ استدعاء الدالة
renderStarsFromValue();

// ===================================================
// ✅ عرض عدد التقييمات
// ===================================================
const ratingCount = document.getElementById("goToReviews");
if (ratingCount) {
  const count = ratingCount.getAttribute("data-count") || "0";
  ratingCount.textContent = `${count} تقييمات`;
}

// ==============================
// ✅ التبويبات الذكية
// ==============================

let enableInitialScroll = false; 

function showTab(id, btn, forceScroll = false) {
  // إخفاء كل التابات وإلغاء التفعيل من الأزرار
  document.querySelectorAll('[id^="tab"]').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab-buttons button').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const stickyHeight = document.querySelector('.tab-buttons')?.offsetHeight || 0;

    // تنفيذ الانزلاق فقط عند السماح أو الطلب الإجباري
    setTimeout(() => {
      if (enableInitialScroll || forceScroll) {
        window.scrollTo({
          top: targetTop - stickyHeight - 10,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  if (btn) btn.classList.add('active');
}

// ✅ فحص التابات وتفعيل أول تبويب عند الجاهزية
let tabCheck = setInterval(() => {
  const firstBtn = document.querySelector('.tab-buttons button');
  const firstTab = document.getElementById('tab1');

  if (firstBtn && firstTab) {
    showTab('tab1', firstBtn);

    document.querySelectorAll('.tab-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('onclick')?.match(/'(.*?)'/)?.[1];
        if (id) showTab(id, btn);
      });
    });

    clearInterval(tabCheck);
  }
}, 100);

setTimeout(() => clearInterval(tabCheck), 5000);

// ==================================
// ✅ التوجيه لتاب التقييمات رقم (5)
// ==================================

const goToReviewsBtn = document.getElementById("goToReviews");
if (goToReviewsBtn) {
  goToReviewsBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const tabButtons = document.querySelectorAll('.tab-buttons button');
    const targetButton = Array.from(tabButtons).find(btn =>
      btn.getAttribute('onclick')?.includes("'tab5'")
    );

    if (targetButton) {
      showTab('tab5', targetButton, true);

      setTimeout(() => {
        const reviewsSection = document.getElementById('tab5');
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  });
}

// ==================================
// 💫 حل ترقيعي للانزلاق المبدئي
// ==================================
window.addEventListener("load", () => {
  // تفعيل الانزلاق المبدئي مؤقتًا
  enableInitialScroll = true;

  // تأخير بسيط لضمان استقرار الصفحة
  setTimeout(() => {
    const firstBtn = document.querySelector('.tab-buttons button');
    const firstTab = document.getElementById('tab1');

    if (firstBtn && firstTab) {
      showTab('tab1', firstBtn, true);
    }

    // تعطيل الانزلاق بعد أول مرة
    enableInitialScroll = false;
  }, 500);
});

// ==============================
// ✅ إضافة صور افتراضية للعملاء 
// ==============================
const avatarURL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgwYjQ3P3sS7yC15Dqs4gAPU3sEGpftVMbqMLwaUbIk5lgxsDIxG5LseYewSYgx9ugKh5wI8ZvMZL_Oh2qZd6FD6lvHbSenXP148Iy3AHvflDx8cO6ysEGc3_nOjv4wbs9USnFA2qdgIvy-WX_ybSngrHNRqpuMSACdhRX19hoQztPYC70WNNpU8zEd/w200-h200/6VBx3io.png";
document.querySelectorAll(".avatar-placeholder").forEach(placeholder => {
  const img = document.createElement("img");
  img.src = avatarURL;
  img.alt = "أفاتار";
  img.className = "reviewer-img";
  placeholder.appendChild(img);
});
