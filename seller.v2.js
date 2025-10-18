/* ================================
   ✅ الجزء الأول: كود صفحة المنتج
   ✅ إظهار شريط البائع ديناميكيًا (مع دعم الفيد المتعدد)
   ================================ */

async function loadSellerBar() {
  const sellerBarContainer = document.getElementById("seller-bar");
  if (!sellerBarContainer) return;

  // ✅ نجيب التصنيف اللي بيبدأ بـ store-
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
  sellerBarContainer.innerHTML = "";
  return;
}

  // الرابط الأساسي للفيد (مع alt=json)
  let feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;
  let found = false;
  let nextLink = null;
  const parser = new DOMParser();

  if (!found) {
  sellerBarContainer.innerHTML = "";
}

  try {
    // نبدأ حلقة تحميل متعددة الصفحات (ديناميكي)
    while (feedUrl && !found) {
      const res = await fetch(feedUrl);
      const data = await res.json();
      const entries = data.feed.entry || [];

      // ندور على أول منشور فيه .bar
      for (const entry of entries) {
        const doc = parser.parseFromString(entry.content.$t, "text/html");
        if (doc.querySelector(".bar")) {
          const sellerBar = doc.querySelector(".bar");
          sellerBarContainer.innerHTML = sellerBar.outerHTML;

          // ✅ نجيب رابط المتجر نفسه
          const sellerLink = (entry.link || []).find(l => l.rel === "alternate")?.href || "#";
          let buttons = sellerBarContainer.querySelector(".buttons");

          if (!buttons) {
            buttons = document.createElement("div");
            buttons.className = "buttons";
            sellerBarContainer.querySelector(".bar").appendChild(buttons);
          }

          // زر "اكتشف المتجر"
          buttons.innerHTML = `<a class="button" href="${sellerLink}">اكتشف المتجر</a>`;
          found = true;
          break;
        }
      }

      // ✅ لو لسه ما لقيناش .bar نحاول نكمل لو فيه rel="next"
      if (!found) {
        const links = data.feed.link || [];
        const next = links.find(l => l.rel === "next");
        nextLink = next ? next.href : null;
        feedUrl = nextLink ? nextLink + "&alt=json" : null;
      }
    }

    if (!found) {
      sellerBarContainer.innerHTML = "<p>⚠️ لم يتم العثور على شريط البائع في أي منشور.</p>";
    }

  } catch (err) {
    console.error("❌ خطأ في تحميل بيانات البائع:", err);
    sellerBarContainer.innerHTML = "<p>⚠️ تعذر تحميل بيانات البائع.</p>";
  }
}

loadSellerBar();



/* =====================================
   ✅ الجزء الثاني: كود صفحة المتجر
   ✅ عرض منتجات البائع ديناميكيًا مع تعدد الصفحات
   ===================================== */

async function loadSellerProducts() {
  const container = document.getElementById("seller-products");
  const pagination = document.getElementById("pagination");
  const loader = document.getElementById("loader");
  if (!container || !pagination || !loader) return;

  // ✅ نجيب التصنيف اللي بيبدأ بـ store-
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
    container.innerHTML = "<p>لم يتم العثور على تصنيف المتجر.</p>";
    return;
  }

  // الرابط الأساسي للفيد
  let feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;
  const allEntries = [];
  let nextLink = null;

  loader.style.display = "block";

  try {
    // 🌀 تحميل كل صفحات الفيد (rel="next") واحدة واحدة
    while (feedUrl) {
      const res = await fetch(feedUrl);
      const data = await res.json();
      const entries = data.feed.entry || [];
      allEntries.push(...entries);

      // نحاول نجيب رابط الصفحة التالية (إن وجد)
      const links = data.feed.link || [];
      const next = links.find(l => l.rel === "next");
      nextLink = next ? next.href : null;
      feedUrl = nextLink ? nextLink + "&alt=json" : null;
    }

    loader.style.display = "none";

    if (!allEntries.length) {
      container.innerHTML = "<p>لا توجد منتجات لهذا البائع</p>";
      return;
    }

    // ✅ إعداد الصفحات
    const perPage = 60;
    let currentPage = 1;
    const totalPages = Math.ceil(allEntries.length / perPage);

    // دالة عرض المنتجات
    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const pageEntries = allEntries.slice(start, end);

      // نولّد HTML المنتجات
      container.innerHTML = pageEntries.map(post => generatePostHTML(post, true)).join("");

      // تحميل كسول للصور لو متاح
      if (typeof lazyLoadImages === "function") lazyLoadImages();

      renderPagination();
    }

    // دالة عرض أزرار الصفحات
    function renderPagination() {
      pagination.innerHTML = "";
      const maxVisible = 10;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => renderPage(i));
        pagination.appendChild(btn);
      }
    }

    // أول تحميل
    renderPage(1);

  } catch (err) {
    console.error("❌ خطأ في تحميل المنتجات:", err);
    loader.style.display = "none";
    container.innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المنتجات.</p>";
  }
}

loadSellerProducts();
