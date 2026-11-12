/* Structura Engineering — minimal site behaviour */
(function () {
  "use strict";

  // Header: subtle opacity change on scroll
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Engineering intake form: validate, then compose an email to Structura.
  var form = document.getElementById("intake-form");
  if (form) {
    var status = document.getElementById("form-status");
    var EMAIL = "hello@structura.in";

    var setStatus = function (msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = isError ? "#B7792B" : "#285B78";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Required-field validation
      var missing = [];
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
        el.style.borderColor = "";
        var ok = el.value.trim() !== "";
        if (ok && el.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        }
        if (!ok) {
          el.style.borderColor = "#B7792B";
          var label = form.querySelector('label[for="' + el.id + '"]');
          missing.push(label ? label.textContent.replace("*", "").trim() : el.name);
        }
      });

      if (missing.length) {
        setStatus("Please complete: " + missing.join(" · "), true);
        var firstBad = form.querySelector('[style*="B7792B"]');
        if (firstBad) firstBad.focus();
        return;
      }

      // Build the enquiry
      var data = new FormData(form);
      var lines = [];
      var evidence = [];
      data.forEach(function (val, key) {
        if (key === "Evidence") {
          evidence.push(val);
        } else if (typeof val === "string" && val.trim() !== "") {
          lines.push(key + ":\n" + val.trim() + "\n");
        }
      });
      if (evidence.length) {
        lines.push("Evidence already available:\n" + evidence.map(function (v) { return " - " + v; }).join("\n") + "\n");
      }

      var subject = "Engineering enquiry — " + (data.get("Company") || data.get("Name") || "Structura website");
      var body = lines.join("\n") + "\n---\nSent from structura.in contact form";
      var mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      setStatus("Opening your email client with the enquiry prepared for " + EMAIL + ". If nothing opens, email us directly.", false);
      window.location.href = mailto;
    });
  }

  // Legacy case-study anchors (#case-NN) no longer exist. If an old link
  // lands here, clear the fragment rather than leaving the visitor stranded.
  if (/^#case-\d+$/i.test(window.location.hash)) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }

  // Mark the active nav item from the current page path
  var here = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (here === "") here = "index.html";
  Array.prototype.forEach.call(document.querySelectorAll(".nav a[href]"), function (a) {
    var target = a.getAttribute("href").split("#")[0].toLowerCase();
    if (target === here) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });
})();
