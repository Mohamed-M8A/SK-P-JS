/* ================================
   ✅ الجزء الأول: كود صفحة المنتج
   ✅ إظهار شريط البائع ديناميكيًا (مع إصلاح مشكلة أول منشور)
   ================================ */
async function loadSellerBar() {
  const sellerBarContainer = document.getElementById("seller-bar");
  if (!sellerBarContainer) return;

  // ✅ البحث عن أي تصنيف يحتوي "store-"
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
    sellerBarContainer.innerHTML = "<p></p>";
    return;
  }

  const feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;

  try {
    const res = await fetch(feedUrl);
    const data = await res.json();
    const entries = data.feed.entry || [];

    if (!entries.length) {
      sellerBarContainer.innerHTML = "<p>⚠️ لم يتم العثور على بيانات البائع.</p>";
      return;
    }

    // ✅ البحث عن أول منشور يحتوي على عنصر .bar
    let storeEntry = null;
    const parser = new DOMParser();

    for (const entry of entries) {
      const doc = parser.parseFromString(entry.content.$t, "text/html");
      if (doc.querySelector(".bar")) {
        storeEntry = entry;
        break; // أول منشور فعلاً فيه bar
      }
    }

    if (!storeEntry) {
      sellerBarContainer.innerHTML = "<p>⚠️ لم يتم العثور على شريط البائع في أي منشور.</p>";
      return;
    }

    // ✅ استخراج شريط البائع من المنشور الصحيح
    const storeDoc = parser.parseFromString(storeEntry.content.$t, "text/html");
    const sellerBar = storeDoc.querySelector(".bar");

    if (sellerBar) {
      sellerBarContainer.innerHTML = sellerBar.outerHTML;

      // ✅ إضافة زر "اكتشف المتجر"
      const sellerLink = (storeEntry.link || []).find(l => l.rel === "alternate")?.href || "#";
      let buttons = sellerBarContainer.querySelector(".buttons");

      if (!buttons) {
        buttons = document.createElement("div");
        buttons.className = "buttons";
        sellerBarContainer.querySelector(".bar").appendChild(buttons);
      }

      buttons.innerHTML = `<a class="button" href="${sellerLink}">اكتشف المتجر</a>`;
    } else {
      sellerBarContainer.innerHTML = "<p>⚠️ لم يتم العثور على عنصر .bar في منشور البائع.</p>";
    }

  } catch (err) {
    console.error("❌ خطأ في تحميل بيانات البائع:", err);
    sellerBarContainer.innerHTML = "<p>⚠️ تعذر تحميل بيانات البائع.</p>";
  }
}

loadSellerBar();



/* =====================================
   ✅ الجزء الثاني: كود صفحة المتجر
   ✅ عرض منتجات البائع ديناميكيًا
   ===================================== */
async function loadSellerProducts() {
  const container = document.getElementById("seller-products");
  const pagination = document.getElementById("pagination");
  const loader = document.getElementById("loader");
  if (!container || !pagination || !loader) return;

  // ✅ البحث عن أي تصنيف يحتوي "store-"
  const labels = Array.from(document.querySelectorAll(".post-labels a"));
  const storeLabel = labels.map(el => el.textContent.trim()).find(l => l.startsWith("store-"));

  if (!storeLabel) {
    container.innerHTML = "<p>لم يتم العثور على تصنيف المتجر.</p>";
    return;
  }

  const feedUrl = `/feeds/posts/default/-/${encodeURIComponent(storeLabel)}?alt=json&max-results=150`;

  loader.style.display = "block";

  try {
    const res = await fetch(feedUrl);
    const data = await res.json();
    const entries = data.feed.entry || [];
    loader.style.display = "none";

    if (!entries.length) {
      container.innerHTML = "<p>لا توجد منتجات لهذا البائع</p>";
      return;
    }

    // ✅ إعداد الصفحات
    const perPage = 60;
    let currentPage = 1;
    const totalPages = Math.ceil(entries.length / perPage);

    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const pageEntries = entries.slice(start, end);

      container.innerHTML = pageEntries.map(post => generatePostHTML(post, true)).join("");
      if (typeof lazyLoadImages === "function") lazyLoadImages();
      renderPagination();
    }

    function renderPagination() {
      pagination.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => renderPage(i));
        pagination.appendChild(btn);
      }
    }

    renderPage(1);
  } catch (err) {
    console.error("❌ خطأ في تحميل المنتجات:", err);
    loader.style.display = "none";
    container.innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المنتجات.</p>";
  }
}

loadSellerProducts();
