let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

const expertName = document.querySelector(".expert_name");
    const expertNamePlace = document.querySelector(".expert_name-place");
    const expertBlock = document.querySelector("#expert_block");
    const chatImgUser = document.querySelector(".img_user");
    const otherMessage = document.querySelector(".other_message");
    const messageForm = document.querySelector(".footer_form");

    function animateBlock(image) {
        let block = document.getElementById('expert_block');
        let img = document.createElement('img');
        let div = document.createElement('div');
        img.setAttribute('src', `data:image/png;base64,${image}`);
        div.classList.add('img_expert-wrap')
        div.insertAdjacentElement('afterbegin', img)
        img.classList.add('expert_img')
        block.insertAdjacentElement('afterbegin', div)
        block.classList.add('show-block');
    }

    // функция для генерации UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

    //функции для работы с куками
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
    }
      
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
    
    function getUserIdFromCookie() {
        return getCookie("user_id");
    }

      async function displayMessageHistory(history) {
        // Очищаем окно сообщений перед отображением новых
        const chatMessageWindow = document.querySelector('.chat_message-window');
        /* chatMessageWindow.innerHTML = ''; */
    
        // Перебираем историю сообщений и добавляем их на страницу
        history.forEach((message) => {
            if (message.role === 'user') {
                addMessage(message.content, 'my_message');
            } else if (message.role === 'assistant') {
                addMessage(message.content, 'other_message');
            }
        });
    
        // Перемещаем скролл вниз, чтобы видеть последние сообщения
        chatMessageWindow.scrollTop = chatMessageWindow.scrollHeight;
    }

    async function getUserHistory(/* userId */) {
        // Добавляем задержку в 100 миллисекунд перед получением cookie
        await new Promise(resolve => setTimeout(resolve, 100));
    
        const userIdFromCookie = getUserIdFromCookie();
        console.log('User ID from cookie:', userIdFromCookie);
    
        const url = 'https://aifounds.xyz/api/get_history';
        const body = {
            user_id: userIdFromCookie
        };
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    
            if (response.ok) {
                const data = await response.json();
                if (data.message === "True") {
                    console.log('История взаимодействий пользователя:', data.response_history);
                    displayMessageHistory(data.response_history); // Отображаем историю сообщений
                    return data.response_history;
                } else {
                    console.log('Неожиданный ответ:', data);
                }
            } else if (response.status === 404) {
                console.error('Ошибка 404: Пользователь не найден. Создайте его сначала.');
            } else if (response.status === 500) {
                console.error('Ошибка 500: Внутренняя ошибка сервера.');
            } else {
                console.error('Неожиданный статус ответа:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    }
    
    async function createUserFetch() {
        try {
            let userId = getUserIdFromCookie();
            if (!userId) {
                userId = generateUUID();
                setCookie("user_id", userId, 365); // Сохраняем куку на 1 год
            }
            console.log('User ID:', userId); // Добавляем вывод текущего ID пользователя
            const url = "https://aifounds.xyz/api/create_user";
            const payload = { user_id: userId };
    
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log("Response from create_user:", data);
            return data;
        } catch (error) {
            console.error("Error during fetch or cookie handling:", error);
            throw error;
        }
    }
    
    function getRandomTimeout(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    const promise = new Promise((resolve) => {
        const randomDelay1 = getRandomTimeout(8000, 13000);
        console.log('Первый randomDelay:', randomDelay1);
    
        setTimeout(() => {
            document.querySelector('.spinner-text').innerHTML = 'Специалист найден. Подключение...';
            console.log('Первый setTimeout сработал через', randomDelay1, 'мс');
        }, randomDelay1);
    
        const randomDelay2 = getRandomTimeout(8000, 13000);
        const totalDelay = randomDelay1 + randomDelay2;
        console.log('Второй randomDelay:', randomDelay2);
        console.log('Суммарная задержка для второго setTimeout:', totalDelay);
    
        setTimeout(() => {
            document.querySelector('.loader-container').classList.add("hidden");
            console.log('Второй setTimeout сработал через', totalDelay, 'мс');
            resolve();
        }, totalDelay);
    });

function animateTyping(message, initialMessage = null) { // Add optional initialMessage parameter
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                /* document.querySelector('.footer').style.opacity = '1'; */
                document.querySelector('.message_wrapper').classList.add('show');
                moveToMessage(document.querySelector('.expert_img'), chatImgUser);
                document.querySelector('.form_textarea').removeAttribute('disabled');
                resolve();
            }, 2000);
        });
        /* promise.then(() => {
            setTimeout(() => {
                createLoadingText('.chat_message-window ');
            }, 1000);
        }); */
        promise.then(() => {
            /* setTimeout(() => { */
                otherMessage.children[0].children[0].innerHTML = initialMessage ? initialMessage : `${message}`; // Use initialMessage if provided
                /* document.querySelector('.form_textarea').removeAttribute('disabled'); */
            /* }, 4000); */
        });
    }

    promise.then(() => {
        let dataa;
        createUserFetch()
            .then((data) => {
                animateBlock(data.image);
                expertName.textContent = data.assistant_name;
                dataa = data;
                return data;
            })
            .then((data) => {
                document.querySelector('.footer').style.opacity = '1';
                setTimeout(() => {
                    moveToChatHeader(expertName, expertNamePlace);
                }, 2000);
                return data;
            })
            .then(() => {
                const userId = getUserIdFromCookie();
                console.log('Получен User ID из куки:', userId);
                if (userId) {
                    console.log('Вызов функции getUserHistory');
                    return getUserHistory(); // Получаем историю сообщений после инициализации
                }
            })
            .then((responseHistory) => {
                console.log('История сообщений:', responseHistory);
                if (responseHistory && responseHistory.length === 0) {
                    animateTyping(dataa.message.charAt(0).toUpperCase() + dataa.message.slice(1));
                } else {
                    setTimeout(() => {
                        document.querySelector('.form_textarea').removeAttribute('disabled');
                    }, 2000);
                    console.log('История сообщений не пуста:', responseHistory);
                }
            })
            .catch((error) => {
                console.error('Ошибка в обработке цепочки промисов:', error);
            });
    });

/*     promise.then(() => {
        createUserFetch()
            .then((data) => {
                animateBlock(data.image);
                expertName.textContent = data.assistant_name;
                return data;
            })
           
            .then((data) => {
                animateTyping(data.message.charAt(0).toUpperCase() + data.message.slice(1));
                setTimeout(() => {
                    moveToMessage(document.querySelector('.expert_img'), chatImgUser);
                }, 2000);
            })
            .then(() => {
                setTimeout(() => {
                    moveToChatHeader(expertName, expertNamePlace);
                }, 1500);
            })
            .then(() => {
                const userId = getUserIdFromCookie();
                if (userId) {
                    getUserHistory(userId); // Получаем историю сообщений после инициализации
                }
            })
    }); */

    function moveToChatHeader(picture, cart) {
        let picture_pos = picture.getBoundingClientRect();
        let cart_pos = cart.getBoundingClientRect();
        setTimeout(() => {
            picture.style.position = "fixed";
            picture.style.left = picture_pos['x'] + "px";
            picture.style.top = picture_pos['y'] + "px";
            picture.style.zIndex = 32767;
            picture.style.color = '#fff'
            picture.style.backgroundColor = 'rgb(167 107 212 / 90%)';
            picture.style.padding = '5px 8px';
            picture.style.borderRadius = '25px'
            let start_x = picture_pos['x'] - 0.1 * picture_pos['width'];
            let start_y = picture_pos['y'] + 0.35 * picture_pos['height'];

            let delta_x = (cart_pos['x'] + 0.5 * cart_pos['width']) - start_x;
            let delta_y = (cart_pos['y'] + 0.5 * cart_pos['height']) - start_y;

            document.body.appendChild(picture);
            void picture.offsetWidth;
            picture.style.transform = "translateX(" + delta_x + "px)";
            picture.style.transform += "translateY(" + delta_y + "px)";
            picture.style.transition = "1s";
            picture.style.color = '#fff'
            picture.style.backgroundColor = 'rgb(167 107 212 / 90%)';
            picture.style.padding = '5px 8px';
            picture.style.borderRadius = '25px'
            picture.style.fontSize = '14px'
        }, 1000)

        document.querySelector('.expert_title').classList.add('hidden');
        document.querySelector('.show-block').classList.add('hidden');
        setTimeout(() => {
            expertNamePlace.appendChild(picture);
            picture.style.position = "static";
            picture.style.color = '#fff';
            picture.style.fontSize = '14px'
        }, 2000)

    }
    function moveToMessage(picture, cart) {
        let picture_pos = picture.getBoundingClientRect();
        let cart_pos = cart.getBoundingClientRect();

        picture.style.position = "fixed";
        picture.style.left = picture_pos['x'] + "px";
        picture.style.top = picture_pos['y'] + "px";
        picture.style.zIndex = 32767;

        let start_x = picture_pos['x'] + 0.5 * picture_pos['width'];
        let start_y = picture_pos['y'] + 0.5 * picture_pos['height'];

        let delta_x = (cart_pos['x'] + 0.5 * cart_pos['width']) - start_x;
        let delta_y = (cart_pos['y'] + 0.5 * cart_pos['height']) - start_y;

        document.body.appendChild(picture);

        void picture.offsetWidth;
        picture.style.transform = "translateX(" + delta_x + "px)";
        picture.style.transform += "translateY(" + delta_y + "px)";
        picture.style.transform += "scale(0.25)";
        picture.style.transition = "1s";


        setTimeout(() => {
            document.querySelector('.img_user').appendChild(picture);
            picture.style.position = "static";
            picture.style.transform = 'none';
        
            function updateImageStyles() {
                if (window.innerWidth > 380) {
                    picture.style.width = '50px';
                    picture.style.height = '50px';
                    document.querySelector('.expert_img').style.width = '50px';
                    document.querySelector('.expert_img').style.height = '50px';
                } else {
                    picture.style.width = '40px';
                    picture.style.height = '40px';
                    document.querySelector('.expert_img').style.width = '40px';
                    document.querySelector('.expert_img').style.height = '40px';
                }
            }
        
            // Вызываем функцию сразу после загрузки страницы
            window.addEventListener('DOMContentLoaded', updateImageStyles);
        
            // Добавляем обработчик события resize
            window.addEventListener('resize', updateImageStyles);
        
            picture.style.display = 'block';
            picture.style.padding = '0';
        }, 1000)
    }

let lastMessageTime = 0;
let messageBuffer = '';
let timeoutId;

console.log(messageBuffer);
console.log(lastMessageTime);
    function addMessage(text, type) {
        let div = document.createElement('div');
        let p = document.createElement('div')
        p.classList.add('chat_typing')
        if (!type) {
            return
        }
        if (type === 'my_message') {
            div.classList.add('test_box');
            div.classList.add('message');
            div.classList.add('my_message');
            div.classList.add('right');
            div.appendChild(p)
            p.textContent = text;
            document.querySelector('.chat_message-window').insertAdjacentElement('afterbegin', div);
        } else if (type === 'other_message') {

            const testBoxDiv = document.createElement('div');//текст сообщения

            const messageWrapper = document.createElement('div');//обертка всего сообщения
            messageWrapper.classList.add('message_wrapper','show');
            testBoxDiv.classList.add('test_box', 'message', 'other_message','left');
            let firstExpertImg = document.querySelector('.expert_img');

            // Создаем первый дочерний div с классом "img_user"
            const imgUserDiv = document.createElement('div');//div с изображением
            imgUserDiv.classList.add('img_user');
            messageWrapper.appendChild(imgUserDiv);
            const expertImg = document.createElement('img');
            expertImg.classList.add('expert_img');
            function updateImageStyles() {
                if (window.innerWidth > 380) {
            expertImg.style.width = '50px'
            expertImg.style.height = '50px'
                } else {
            expertImg.style.width = '40px'
            expertImg.style.height = '40px'
                }
            }
            // Вызываем функцию сразу после загрузки страницы
            window.addEventListener('DOMContentLoaded', updateImageStyles);
        
            // Добавляем обработчик события resize
            window.addEventListener('resize', updateImageStyles);

            // устанавлтваем атрибут из изображения полученного с бэка 
            expertImg.setAttribute('src', firstExpertImg.getAttribute('src'));
            imgUserDiv.appendChild(expertImg);
            messageWrapper.appendChild(testBoxDiv)

            // Создаем второй дочерний div с классом "chat_typing"
            const chatTypingDiv = document.createElement('div');
            chatTypingDiv.classList.add('chat_typing');
            testBoxDiv.appendChild(chatTypingDiv);
            chatTypingDiv.textContent = text;
            document.querySelector('.chat_message-window').insertAdjacentElement('afterbegin', messageWrapper);
        }
    }

  let writeWaiting = 0;
      let dataMessage = '';
      console.log(writeWaiting);
      console.log(dataMessage);


      function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            return new Promise((resolve) => {
                timeout = setTimeout(() => {
                    resolve(func.apply(this, args));
                }, wait);
            });
        };
    }

    async function handleMessage() {
      if (messageBuffer) {
          console.log("Обработка сообщения...");
          // Запускаем обе функции параллельно в рамках одного await
          await Promise.all([
              messageFetch(messageBuffer),
              /* createLoadingText('.chat_message-window', writeWaiting) */
          ]);
          messageBuffer = '';
      }
  }

    async function createLoadingText(pasteTo, writeWaiting) {
          console.log("Создание загрузочного текста...");
          const waveDiv = document.createElement('div');
          waveDiv.classList.add('loading-wave');
      
          for (let i = 0; i < 4; i++) {
              const barDiv = document.createElement('div');
              barDiv.classList.add('loading-bar');
              waveDiv.appendChild(barDiv);
          }
          document.querySelector(pasteTo).insertAdjacentElement('afterbegin', waveDiv);
      
          // Установить таймер для окончательного скрытия
          setTimeout(() => {
              document.querySelectorAll('.loading-wave').forEach(elem => {
                  elem.classList.add('hidden');
              });
          }, writeWaiting);
      }

    document.querySelectorAll(".accordion-item").forEach((item) => {
        item.querySelector(".accordion-item-header").addEventListener("click", () => {
            item.classList.toggle("open");
        });
        
    });

    
    async function messageFetch(message) {
      console.log("Запрос на сервер для получения сообщения...");
      const userId = getUserIdFromCookie();
      if (!userId) {
          console.error("Ошибка: Идентификатор пользователя не найден в cookie");
          return Promise.reject("Идентификатор пользователя не найден в cookie");
      }
      const BASE_URL = "https://aifounds.xyz";
      const url = `${BASE_URL}/api/get_message`;
  
      const payload = {
          user_id: userId,
          message: message,
      };
  
      const headers = {
          "Content-Type": "application/json",
      };
  
      try {
          
  
          const response = await fetch(url, {
              method: "POST",
              headers: headers,
              body: JSON.stringify(payload),
          });
  
          if (response.ok) {
              const data = await response.json();
              dataMessage = data.message;
              writeWaiting = data.message.length / 10 * 1000;
              console.log("Данные получены успешно");
              console.log(writeWaiting);
            createLoadingText('.chat_message-window', writeWaiting);
              setTimeout(() => {
                  addMessage(data.message.charAt(0).toUpperCase() + data.message.slice(1), 'other_message');
              }, writeWaiting);
              
              return data;
          } else if (response.status === 404) {
              console.error("Ошибка: Пользователь не найден");
              return Promise.reject("Пользователь не найден");
          } else {
              const errorText = await response.text();
              console.error("Ошибка:", response.status, errorText);
              return Promise.reject(`Ошибка: ${response.status} ${errorText}`);
          }
      } catch (error) {
          console.error("Ошибка во время запроса:", error);
          return Promise.reject(error);
      }
  }

 messageForm.addEventListener('submit', (e) => {
          e.preventDefault();
          let inputValue = document.querySelector('.form_textarea').value;
          if (inputValue) {
              addMessage(inputValue, 'my_message');
      
              let currentTime = Date.now();
              if (currentTime - lastMessageTime < 10000) {
                  messageBuffer += ' ' + inputValue;
              } else {
                  if (messageBuffer) {
                      handleMessage();
                  }
                  messageBuffer = inputValue;
              }
              lastMessageTime = currentTime;
              console.log(messageBuffer);
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                  handleMessage();
              }, 10000);
          }
          document.querySelector('.form_textarea').value = '';
      });