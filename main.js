// function jsonPost(url, data) {
//   return new Promise((resolve, reject) => {
//     var x = new XMLHttpRequest();
//     x.onerror = () => reject(new Error("jsonPost failed"));
//     //x.setRequestHeader('Content-Type', 'application/json');
//     x.open("POST", url, true);
//     x.send(JSON.stringify(data));

//     x.onreadystatechange = () => {
//       if (x.readyState == XMLHttpRequest.DONE && x.status == 200) {
//         resolve(JSON.parse(x.responseText));
//       } else if (x.status != 200) {
//         reject(new Error("status is not 200"));
//       }
//     };
//   });
// }

async function jsonPost(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      // headers: { "Content-Type": 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const json = await response.json();
      return json;
    } else {
      throw new Error("status is not 200");
    }
  } catch (error) {
    throw new Error("jsonPost failed");
  }
}

async function setMessages() {
  const form = document.getElementById("firstform");
  const nickInput = document.getElementById("nick");
  const messageInput = document.getElementById("message");

  form.onsubmit = async (event) => {
    event.preventDefault();

    const nick = nickInput.value;
    const message = messageInput.value;

    try {
      const response = await jsonPost("http://students.a-level.com.ua:10012", {
        func: "addMessage",
        nick: nick,
        message: message,
      });
      console.log(response.nextMessageId);

      // всунула сюда шоб было
      sendAndCheck();
    } catch (error) {
      console.error(error);
    }
    // nickInput.value = "";
    messageInput.value = "";
  };
}

setMessages();

async function getMessages() {
  let nextMessageId = 10870;
  try {
    const responseMessage = await jsonPost(
      "http://students.a-level.com.ua:10012",
      { func: "getMessages", messageId: nextMessageId }
    );
    const mesageResult = responseMessage.data;
    nextMessageId = mesageResult.nextMessageId;

    const chatInput = document.getElementById("chatWhithNobody");
    chatInput.innerHTML = "";
    mesageResult.forEach((message) => {
      const messageNewDiv = document.createElement("div");
      const time = new Date(message.timestamp).toLocaleString();
      messageNewDiv.innerHTML = `${message.nick} сказал :${message.message} в ${time}`;
      chatInput.append(messageNewDiv);
    });
  } catch (error) {
    console.error(error);
  }
}
// setInterval(getMessages,5000)

// непонятно как ее запустить по сабмиту формы, не знаю куда ее приписать нигде не работает нормально

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkLoop() {
  while (true) {
    await delay(2000);
    await getMessages();
  }
}

async function sendAndCheck() {
  try {
    await setMessages();
    await checkLoop();
  } catch (err) {
    console.error(err);
  }
}

// =====

function domEventPromise(element, eventName) {
  return new Promise(function (resolve) {
    function someFunction(event) {
      resolve(event);
    }

    element.removeEventListener(eventName, someFunction);
    element.addEventListener(eventName, someFunction);
  });
}
let knopka = document.createElement("button");
knopka.style.backgroundColor = "crimson";
knopka.style.width = "100px";
knopka.style.height = "100px";
knopka.style.fontSize = "15px";
knopka.style.color = "white";
knopka.style.fontWeight = "bold";
knopka.innerText = "Давай жми не стесняйся";

document.body.append(knopka);

domEventPromise(knopka, "click").then((e) =>
  console.log("event click happens", e)
);

// ======= отстой а не мастер Йода, выдает ошибки и не раскрывает все ссылки
async function swapiLinks(url) {
  const response = await fetch(url);
  const data = await response.json();

  const allRromises = [];

  for (let i in data) {
    if (typeof data[i] === "string" && data[i].includes("http")) {
      const resp = await fetch(data[i]);
      const respData = await resp.json();
      data[i] = respData;
      allRromises.push(data[i]);
    } else {
      if (Array.isArray(data[i])) {
        for (let k of data[i])
          if (typeof k === "string" && k.includes("http"))
          {
            swapiLinks(k);
          }
      }
    }
  }

  await Promise.all(allRromises);
  return data;
}

swapiLinks("https://swapi.dev/api/people/20/").then((yodaWithLinks) =>
  console.log(JSON.stringify(yodaWithLinks, null, 4))
);
