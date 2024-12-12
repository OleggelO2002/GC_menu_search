// ======= Отвечает за меню - аккордеон =======
// Этот блок отвечает за раскрытие и закрытие меню
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () { 

        const menuItems = document.querySelectorAll(".gc-account-user-menu .menu-item");

        menuItems.forEach(item => {
            item.addEventListener("click", async function () {
                if (item.classList.contains("menu-item-profile") || item.classList.contains("menu-item-notifications_button_small")) {
                    return;
                }

                const isAlreadySelected = item.classList.contains("select");

                menuItems.forEach(el => {
                    el.classList.remove("select");
                    const submenu = el.querySelector(".custom-submenu-bar");
                    if (submenu) {
                        submenu.classList.remove("open");
                        submenu.style.display = "none";
                    }
                    if (!el.classList.contains("menu-item-profile") && !el.classList.contains("menu-item-notifications_button_small")) {
                        el.style.height = '56px';
                        const link = el.querySelector("a");
                        if (link) {
                            link.style.height = '56px';
                        }
                    }
                });

                if (isAlreadySelected) return;

                item.classList.add("select");

                await waitForSubmenuLoad();

                const submenu = document.querySelector(".gc-account-user-submenu");
                if (submenu) {
                    let newSubmenu = item.querySelector(".custom-submenu-bar");

                    if (!newSubmenu) {
                        const newSubmenuHTML = `
                            <div class="custom-submenu-bar" style="margin-top: 10px; display: none;">
                                <ul class="custom-submenu"></ul>
                            </div>
                        `;
                        item.insertAdjacentHTML("beforeend", newSubmenuHTML);
                        newSubmenu = item.querySelector(".custom-submenu-bar");
                    }

                    const customSubmenu = newSubmenu.querySelector(".custom-submenu");
                    customSubmenu.innerHTML = "";
                    submenu.querySelectorAll("li").forEach(submenuItem => {
                        const clonedItem = submenuItem.cloneNode(true);
                        clonedItem.style.opacity = 0; // Изначально скрываем пункт
                        clonedItem.style.transform = "translateY(-10px)"; // Добавляем начальную позицию
                        customSubmenu.appendChild(clonedItem);
                    });

                    newSubmenu.style.display = "block";

                    setTimeout(() => {
                        newSubmenu.classList.add("open");
                    }, 10);

                    const submenuItems = customSubmenu.querySelectorAll("li");
                    submenuItems.forEach((submenuItem, index) => {
                        setTimeout(() => {
                            submenuItem.style.transition = "opacity 0.3s, transform 0.3s"; // Анимация
                            submenuItem.style.opacity = 1;
                            submenuItem.style.transform = "translateY(0)"; // Возвращаем в исходное положение
                        }, index * 100); // Задержка между пунктами
                    });

                    const submenuHeight = newSubmenu.scrollHeight;
                    item.style.height = `${submenuHeight + 6}px`;

                    const link = item.querySelector("a");
                    if (link) {
                        link.style.height = `${submenuHeight + 6}px`;
                    }
                }
            });
        });

        function waitForSubmenuLoad() {
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    if (document.querySelector(".gc-account-user-submenu")) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
   
});

document.addEventListener("DOMContentLoaded", function () {
  // Наблюдаем за изменениями в DOM
  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Проверяем, появились ли нужные элементы
        const profileElement = document.querySelector(".gc-account-user-submenu-bar-profile");
        const notificationsElement = document.querySelector(".gc-account-user-submenu-bar-notifications_button_small");

        if (profileElement && !profileElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу profile
          addCloseButton(profileElement);
        }

        if (notificationsElement && !notificationsElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу notifications
          addCloseButton(notificationsElement);
        }
      }
    }
  });

  // Указываем элемент, за которым следим
  const targetNode = document.querySelector("body");
  observer.observe(targetNode, { childList: true, subtree: true });

  // Функция добавления крестика
  function addCloseButton(parentElement) {
    const closeButton = document.createElement("div");
    closeButton.className = "close-button";
    closeButton.innerHTML = `
      <img 
        src="https://static.tildacdn.com/tild6566-6530-4235-a537-666432303963/close.svg" 
        alt="Закрыть" 
        style="width: 15px; height: 15px; cursor: pointer;" 
      />
    `;
    parentElement.prepend(closeButton);

    // Добавляем обработчик клика на крестик
    closeButton.addEventListener("click", function () {
      parentElement.style.display = "none";
    });
  }
});




// ======= Отвечает за поиск - обработчик + HTML =======
// Этот блок добавляет обработчик для поля поиска и отображает результаты
// ==========================================================================

// HTML-код для мобильной версии
const searchContainerHTMLMobile = `
  <div id="searchContainerMobile" style="position: relative; z-index: 1000; display: flex; align-items: center; background-color: white; border-radius: 20px; overflow: hidden; width: 40px; transition: width 0.3s ease;">
    <img src="https://static.tildacdn.com/tild3934-3633-4936-a333-663362386266/Search_Magnifying_Gl.svg" alt="Search" style="width: 20px; height: 20px; margin: 10px; cursor: pointer;">
    <input type="text" id="searchInputMobile" placeholder="Введите название тренинга или урока" style="border: none; outline: none; flex-grow: 1; padding: 5px; display: none;">
    <div id="searchResultsMobile" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background-color: white; border: 1px solid #ccc; border-radius: 5px; max-height: 200px; overflow-y: auto; z-index: 1001;"></div>
  </div>
`;

// HTML-код для десктопной версии
const searchContainerHTMLDesktop = `
  <div id="searchWrapper" style="width: 100%; background-color: #f8f8f8; padding: 10px; box-sizing: border-box;">
    <div id="searchContainer" style="position: relative; z-index: 1000; display: flex; align-items: center; background-color: white; border-radius: 20px; padding: 0 10px;">
      <img src="https://static.tildacdn.com/tild3934-3633-4936-a333-663362386266/Search_Magnifying_Gl.svg" alt="Search" style="width: 20px; height: 20px; margin-right: 10px;">
      <input type="text" id="searchInput" placeholder="Введите название тренинга или урока" style="border: none; outline: none; flex-grow: 1;">
      <div id="searchResults" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background-color: white; border: 1px solid #ccc; border-radius: 5px; max-height: 200px; overflow-y: auto; z-index: 1001;"></div>
    </div>
  </div>
`;

// Функция для добавления HTML-кода в нужные элементы
function addSearchContainer() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const mobileObserver = new MutationObserver(() => {
      const leftBar = document.querySelector('.gc-account-leftbar');

      if (leftBar && !leftBar.querySelector('#searchContainerMobile')) {
        leftBar.insertAdjacentHTML('afterbegin', searchContainerHTMLMobile);

        const searchContainer = document.getElementById('searchContainerMobile');
        const searchInput = document.getElementById('searchInputMobile');
        const searchIcon = searchContainer.querySelector('img');
        const searchResults = document.getElementById('searchResultsMobile');

        searchIcon.addEventListener('click', (event) => {
          event.stopPropagation();
          const isExpanded = searchContainer.style.width === '72vw';

          searchContainer.style.width = isExpanded ? '40px' : '72vw';
          searchInput.style.display = isExpanded ? 'none' : 'block';
          searchResults.style.display = 'none';
        });

        searchInput.addEventListener('input', () => {
          // Логика обновления результатов поиска
          searchResults.style.display = 'block';
          searchResults.innerHTML = `<p>Результаты для "${searchInput.value}"</p>`;
        });

        document.addEventListener('click', (event) => {
          if (!searchContainer.contains(event.target)) {
            searchContainer.style.width = '40px';
            searchInput.style.display = 'none';
            searchResults.style.display = 'none';
          }
        });
      }
    });

    mobileObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    const desktopObserver = new MutationObserver(() => {
      const mainContentUser = document.querySelector('.gc-main-content.gc-both-main-content.no-menu.account-page-content.with-left-menu.gc-user-logined.gc-user-user');
      const mainContentAdmin = document.querySelector('.gc-main-content.gc-both-main-content.wide.account-page-content.with-left-menu.gc-user-logined.gc-user-admin');

      const targetElement = mainContentUser || mainContentAdmin;

      if (targetElement && !targetElement.querySelector('#searchWrapper')) {
        targetElement.insertAdjacentHTML('afterbegin', searchContainerHTMLDesktop);

        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', () => {
          // Логика обновления результатов поиска
          searchResults.style.display = 'block';
          searchResults.innerHTML = `<p>Результаты для "${searchInput.value}"</p>`;
        });
      }
    });

    desktopObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Вызвать функцию для добавления контейнера
addSearchContainer();

// Обработчик для изменения размера окна
window.addEventListener('resize', () => {
  addSearchContainer();
});



$(document).ready(function () {
  let typingTimer;
  const typingDelay = 1000;

  // Определение, используется ли мобильная версия
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Функция для выполнения поиска
  function getData(searchStr, callback) {
    $.getJSON('/c/sa/search', { searchStr }, function (response) {
      if (response.success === true && Array.isArray(response.data.blocks)) {
        const results = response.data.blocks
          .filter(block => block.onClick?.url) // Учитываем только блоки с ссылкой
          .map(function (block) {
            const domain = window.location.origin;
            const fullUrl = domain + block.onClick.url;
            const isLesson = fullUrl.includes('lesson'); // Проверяем, содержит ли URL слово 'lesson'
            return {
              isLesson,
              title: block.title || "Без названия",
              description: block.description || "Нет описания",
              image: block.logo?.image || null,
              url: fullUrl
            };
          });
        callback(results);
      } else {
        callback([]);
      }
    });
  }

  // Рендеринг результатов поиска
  function renderResults(results, searchResults) {
    if (results.length > 0) {
      const lessons = results.filter(result => result.isLesson); // Уроки
      const trainings = results.filter(result => !result.isLesson); // Тренинги

      let resultItems = '';

      // Добавляем заголовок и элементы для тренингов
      if (trainings.length > 0) {
        resultItems += '<h2>Тренинги</h2>';
        resultItems += trainings.map(function (result) {
          return `
            <div class="result-item training-item">
              ${result.image ? `<img src="${result.image}" alt="Результат" />` : ""}
              <h3>${result.title}</h3>
              <p>${result.description}</p>
              <a href="${result.url}" target="_blank">Перейти</a>
            </div>
          `;
        }).join('');
      }

      // Добавляем заголовок и элементы для уроков
      if (lessons.length > 0) {
        resultItems += '<h2>Уроки</h2>';
        resultItems += lessons.map(function (result) {
          return `
            <div class="result-item lesson-item">
              ${result.image ? `<img src="${result.image}" alt="Результат" />` : ""}
              <h3>${result.title}</h3>
              <p>${result.description}</p>
              <a href="${result.url}" target="_blank">Перейти</a>
            </div>
          `;
        }).join('');
      }

      searchResults.html(resultItems);
    } else {
      searchResults.html('<p>Ничего не найдено.</p>');
    }

    searchResults.addClass('visible'); // Показываем блок
  }

  // Скрытие результатов при клике вне блока
  $(document).on('click', function (event) {
    const searchContainer = isMobile() ? $('#searchContainerMobile') : $('#searchContainer');
    const searchResults = isMobile() ? $('#searchResultsMobile') : $('#searchResults');

    if (!searchContainer.is(event.target) && searchContainer.has(event.target).length === 0) {
      searchResults.removeClass('visible');
    }
  });

  // Обработчик для поиска (и на ПК, и на мобильной версии)
  $(document).on('input', '#searchInput, #searchInputMobile', function () {
    clearTimeout(typingTimer);

    const searchInput = $(this);
    const searchResults = isMobile() ? $('#searchResultsMobile') : $('#searchResults');
    const searchStr = searchInput.val().trim();

    if (searchStr) {
      typingTimer = setTimeout(function () {
        getData(searchStr, function (results) {
          renderResults(results, searchResults);
        });
      }, typingDelay);
    } else {
      searchResults.removeClass('visible').empty();
    }
  });

  // Отслеживаем появление мобильных элементов
  $(document).on('click', '.search-icon', function () {
    setTimeout(function () {
      const searchInput = $('#searchInputMobile');
      if (searchInput.length > 0) {
        searchInput.trigger('focus'); // Автоматически ставим фокус
      }
    }, 300); // Ожидание перед проверкой, чтобы элементы успели подгрузиться
  });
});
