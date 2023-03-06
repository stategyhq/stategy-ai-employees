/*/ Not change any values of the variables below, 
use the "json/config.json" file to make your settings. /*/
$(document).foundation();
let data_index = "";
let character_name = "";
let character_image = "";
let character_background_color = "";
let character_training = "";
let audio_button_lang = "";
let dalle_img_size = "";
let CHAT_PHP_url = 'php/api.php';
let DALLE_PHP_url = 'php/dall-e-2.php';
let API_URL = "";
let API_MODEL = "";

let dalle_generated_img_count = 1;
let chat_minlength = 0;
let chat_maxlength = 0;
let character_temperature = 1;
let character_frequency_penalty = 0;
let character_presence_penalty = 0;
let lang_index = 0;

let shuffle_character = false;
let is_model_turbo = false;
let use_php_api = false;
let display_avatar_in_chat = false;
let filter_badwords = true;
let display_audio_button_answers = true;
let chat_history = true;
let hasBadWord = false;

let chat = [];
let pmt = [];
let array_characters = [];
let array_chat = [];
let lang = [];
let = badWords = []
let array_messages = [];
let filterBotWords = ["Robot:", "Bot:"];

if (window.location.protocol === 'file:') {
  alert('This file is not runnable locally, an http server is required, please read the documentation.');
}

//Loads the characters from the config.json file and appends them to the initial slider
loadData("json/config.json", ["json/character.json", "json/lang.json", "json/badwords.json"]);

function loadData(url, urls) {
  // Fetch data from the given url and an array of urls using Promise.all and map functions
  return Promise.all([fetch(url).then(res => res.json()), ...urls.map(url => fetch(url).then(res => res.json()))])
    .then(([out, OutC, OutL, OutB]) => {
      // Extract necessary data from the response
      lang = OutL;
      if(filter_badwords){badWords = OutB.badwords.split(',')}
      lang_index = lang.use_lang_index;
      API_MODEL = out.API_MODEL;
      display_avatar_in_chat = out.display_avatar_in_chat;
      display_audio_button_answers = out.display_audio_button_answers;
      filter_badwords = out.filter_badwords;
      chat_history = out.chat_history;
      chat_minlength = out.chat_minlength;
      chat_maxlength = out.chat_maxlength;
      dalle_img_size = out.dalle_img_size;
      dalle_generated_img_count = out.dalle_generated_img_count;
      max_num_chats_api = out.max_num_chats_api;
      shuffle_character = out.shuffle_character;
      audio_button_lang = lang.translate[lang_index].code_lang;
      is_model_turbo = API_MODEL.includes('-turbo');
      // Set the maxlength attribute of the chat element to the value of chat_maxlength
      $("#chat").attr("maxlength",chat_maxlength)

      if(shuffle_character){
        OutC = shuffleArray(OutC);
      }
      // Populate array_characters with character data and create HTML elements for each character card
      $("#load-character").html("");
      for (var i = 0; i < OutC.length; i++) {
        array_characters.push({
          'name':OutC[i]['name'], 
          'image':OutC[i]['image'], 
          'description':OutC[i]['description'], 
          'welcome_message':OutC[i]['welcome_message'], 
          'display_welcome_message':OutC[i]['display_welcome_message'],
          'expert':OutC[i]['expert'],
          'background_thumb_color':OutC[i]['background_thumb_color'],
          'training':OutC[i]['training'],
          'temperature':OutC[i]['temperature'],
          'frequency_penalty':OutC[i]['frequency_penalty'],
          'presence_penalty':OutC[i]['presence_penalty'],
          'last_chat':""
        })

        $("#load-character").append(`
          <div class="swiper-slide">
            <div class="character-card">
              <div class="character-avatar" style="background:${array_characters[i]['background_thumb_color']}">
                <img src="${array_characters[i]['image']}" alt="${array_characters[i]['name']}" title="${array_characters[i]['name']}" data-index="${i}" class='open-modal'>
                <span class="character-category">${array_characters[i]['expert']}</span>
              </div>
              <div class="character-name"><h3>${array_characters[i]['name']}</h3></div>
              <div class="character-description"><p>${array_characters[i]['description']}</p>
              <div class="character-button">
                <span data-index="${i}" class='open-modal'><b>Talk to</b>${array_characters[i]['name']}</span>
              </div>
              </div>
            </div>        
          </div>
        `)}
      // Initialize swiperCharacters to display character cards
      swiperCharacters.init();

      // Get chat history and update the last_chat property for each character
		  if(chat_history){
				arr2 = JSON.parse(localStorage.getItem("smartanimals_chat_v2"));
				array_characters.forEach((item1) => {
				  const item2 = (arr2 && arr2.find((item2) => item2.name === item1.name));
				  if (item2) {
				    item1.last_chat = item2.last_chat;
				  }
				});
			}
			translate();
			$("#loading").fadeOut();

		}).catch(err => { throw err })}

		function currentDate(){
			const timestamp = new Date();
			return timestamp.toLocaleString();
		}

		//Main function of GPT-3 chat API
		async function getResponse(prompt) {

			//Conversation history
			array_chat.push({"name":"User","message":prompt,"date":currentDate()})			
			array_messages = [];

			//Converting chat to turbo API model
			for (let i = 0; i < array_chat.length; i++) {
			  let message = {"role": "", "content": ""};

			  if (array_chat[i].training === true) {
			    let system_message = {"role": "system", "content": array_chat[i].message};
			    array_messages.push(system_message);
			  }else{
					if (array_chat[i].name === "User") {
				    message.role = "user";
				  } else {
				    message.role = "assistant";
				  }
				  message.content = array_chat[i].message; 
				  array_messages.push(message);
			  }
			}

			if (array_messages.length > max_num_chats_api) {
				var slice_messages = max_num_chats_api - 2;
			  array_messages = array_messages.slice(0, 2).concat(array_messages.slice(-slice_messages));
			}

			const data = {
			  array_chat: array_messages,
			  character_name: character_name,
			  model:API_MODEL,
			  temperature:character_temperature,
			  frequency_penalty:character_frequency_penalty,
			  presence_penalty:character_presence_penalty
			};				

			fetch(CHAT_PHP_url, {
			  method: 'POST',
			  body: JSON.stringify(data),
			  headers: {
			    'Content-Type': 'application/json'
			  }
			})
			.then(response => response.json())
			.then(data => {
			  if (data.status == 1) {
			    responseChat(data.message);
			  } else{
			  	toastr.error("❌ "+data.message)
			  	enableChat();
			  }
			})
		}

		function saveChatHistory(){
			array_characters[data_index].last_chat = array_chat;
			if(chat_history){
				localStorage.setItem("smartanimals_chat_v2", JSON.stringify(array_characters));
			}			
			console.log("saving...")
		}

		//Function that appends the AI response in the chat in html
		function responseChat(response){

			for (var i = 0; i < filterBotWords.length; i++) {
			    if (response.indexOf(filterBotWords[i]) !== -1) {
			        response = response.replace(filterBotWords[i], "");
			    }
			}

			array_chat.push({"name":character_name,"message":response, "date":currentDate()})
			response = escapeHtml(response)
		
			avatar_in_chat = "";
			if(display_avatar_in_chat === true){
				avatar_in_chat = `<div class="avatar-chat"><img src="${character_image}" alt="${character_name}" title="${character_name}"></div>`;
			}

			audio_in_chat = "";
			if(display_audio_button_answers === true){
				audio_in_chat = `<div class='chat-audio'><img data-play="false" src='img/btn_tts_play.svg'></div>`;
			}	

			
			$("#overflow-chat").append(`
				<div class="chat border-character" style="border-color: ${character_background_color}">	
						${avatar_in_chat}
						${audio_in_chat}
						<div class="wrapper-name-and-chat">
							<div class="name">${character_name}</div>
							<div class="chat-response">${response}</div>
							<div class='date-chat'><img src='img/icon-clock.svg'> ${currentDate()}</div>
						</div>
				</div>
			`);
			scrollChatBottom();	
			enableChat();
			saveChatHistory();
			checkClearChatDisplay();
		}

		function appendChatImg(chat){
			const imageID = Date.now();
			IAimagePrompt = chat.replace("/img ","");

			$("#overflow-chat").append(`
				<div class="chat border-character" style="border-color: ${character_background_color}">	
						${avatar_in_chat}
						${audio_in_chat}
						<div class="wrapper-name-and-chat">
							<div class="name">${character_name}</div>
							   <div class="chat-response no-white-space">
							   ${lang["translate"][lang_index].creating_ia_image} <strong class='ia-image-prompt-label'>${IAimagePrompt}</strong>
								   <div class="wrapper-image-ia image_ia_${imageID}">
			                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
			                  <circle cx="50" cy="50" r="40" stroke="#ffffff" stroke-width="8" fill="none" />
			                  <circle cx="50" cy="50" r="40" stroke="#000000" stroke-width="8" fill="none" stroke-dasharray="250" stroke-dashoffset="0">
			                    <animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="250" />
			                  </circle>
			                </svg>
								   </div>
								   <p class='expire-img-message'>${lang["translate"][lang_index].expire_img_message}</p>
							   </div>
							   <div class='date-chat'><img src='img/icon-clock.svg'> ${currentDate()}</div>
							</div>
						</div>
				</div>
			`);	
			scrollChatBottom();
			$("#chat").val("");	

			const data = {
			  model: "image-alpha-001",
			  prompt: IAimagePrompt,
			  num_images: dalle_generated_img_count,
			  size: dalle_img_size
			};

			fetch(DALLE_PHP_url, {
			  method: 'POST',
			  body: JSON.stringify(data),
			  headers: {
			    'Content-Type': 'application/json'
			  }
			})
			.then(response => response.json())
			.then(data => {
			  if (data.status == 1) {
		    $(".wrapper-image-ia svg").remove();
		    const images = data.message.data;
		    for (let i = 0; i < images.length; i++) {
		      $(".image_ia_"+imageID).append(`<div class="image-ia"><img  onerror="this.src='img/no-image.svg'" src="${images[i].url}"></div>`)
		    }

				const imageUrls = images.map(image => image.url);
		    array_chat.push({"name":"User","message":lang["translate"][lang_index].creating_ia_image_chat_instruction+" "+IAimagePrompt,"isImg":true,imgURL: imageUrls,"date":currentDate()})

			  scrollChatBottom();	
				enableChat();		    
				saveChatHistory();

			  } else{
			  	toastr.error("❌ "+data.message)
			  	enableChat();
			  }
			})			
		}

		//Function that sends the user's question to the chat in html and to the API
		function sendUserChat(){
			let chat = $("#chat").val();

			if(filter_badwords){
				// Create regex to check if word is forbidden
	    	const regex = new RegExp(`\\b(${badWords.join('|')})(?=\\s|$)`, 'gi');
	      // Check if message contains a bad word
	      const hasBadWord = regex.test(chat);
	      // Replace bad words with asterisks
	      if(hasBadWord){
		      const sanitizedMessage = chat.replace(regex, match => '*'.repeat(match.length));
		      $("#chat").val(sanitizedMessage);
		      toastr.error(`${lang["translate"][lang_index].badword_feedback}`);
		      return false;
	      }
    	}

			//checks if the user has entered the minimum amount of characters
			if(chat.length < chat_minlength){
				toastr.error(`${lang["translate"][lang_index].error_chat_minlength} ${chat_minlength} ${lang["translate"][lang_index].error_chat_minlength_part2}`);
				return false;
			}
			
			chat = escapeHtml(chat)			

			$("#overflow-chat").append(`
				<div class="chat border-you">	
					<div class="wrapper-name-and-chat">
						<div class="name">You</div>
						<div class="chat-response">${chat}</div>
						<div class='date-chat'><img src='img/icon-clock.svg'> ${currentDate()}</div>
					</div>
				</div>
			`);
			scrollChatBottom();
			hljs.highlightAll();

			if(chat.includes("/img")) {
				appendChatImg(chat);
			}else{
				getResponse(chat);
			}

			$("#chat").val("");
			disableChat();
		}

		//Send message in chat by pressing enter
		$("#chat").keypress(function (e) {
		    if(e.which === 13 && !e.shiftKey) {
		        sendUserChat();
		        return false;
		    }
		});

		//Send message
		$(".btn-send-chat").on("click", function(){
			sendUserChat();
		})


		// Function to shuffle the array
		function shuffleArray(array) {
		  return array.sort(() => Math.random() - 0.5);
		}

		function translate() {
			const translationObj = {
				"h1": "main_title",
				".character-button b": "button_talk_to",
				"#close-chat span": "button_close",
				".btn-send-chat span": "button_send",
				"#download-chat span": "button_download_chat",
				"#clear-chat span": "button_clear_chat",
				"#clear-all-chats span": "button_clear_all_chats",
				"#chat": "input_placeholder",
				".wait": "wait",
				".is_typing": "is_typing",
				".wrapper-name-and-chat .name": "you",
				".label-copy-code": "copy_code1"
			};

			Object.keys(translationObj).forEach(function(key) {
				const value = translationObj[key];


				if (key === '#chat') {
					$(key).attr('placeholder', lang["translate"][lang_index][value]);
				} else {
					$(key).html(lang["translate"][lang_index][value]);
				}
			});
		}

		function closeChat(){
			hideModal();
			enableChat();
		}

		document.addEventListener("keydown", function(event) {
		  if (event.key === "Escape") {
		    hideModal();
		  }
		});		

		function hideModal(){
			$("#chatModal,.title-bar").hide();
			hideFeedback();
			cancelSpeechSynthesis();
		}

		//Open modal (chat)
		$(document).delegate(".open-modal", "click", function() {
			data_index = $(this).attr("data-index");
			$(".title-bar").show();
			array_messages = [];
			$("#overflow-chat").html("");
			$(".mobile-menu-toogle").hide()
			array_chat = [];
			character_name = array_characters[data_index]['name'];
			character_image = array_characters[data_index]['image'];
			character_background_color = array_characters[data_index]['background_thumb_color'];
			character_temperature = array_characters[data_index]['temperature'];
			character_frequency_penalty = array_characters[data_index]['frequency_penalty'];
			character_presence_penalty = array_characters[data_index]['presence_penalty'];
			character_training = array_characters[data_index]['training'];
 			displayWelcomeMessage = array_characters[data_index]['display_welcome_message'];
 			welcome_message = array_characters[data_index]['welcome_message'];
 			lastChatLength = array_characters[data_index]['last_chat'].length;

			if (lastChatLength > 0) {
			  loadChat();
			} else {
			  const chat = {"name": character_name, "message": character_training, "training": true, "date": currentDate()};
			  array_chat.push(chat);
			  if (displayWelcomeMessage) {
			    responseChat(array_characters[data_index]['welcome_message']);
			  }
			}


			$("#chatModal").fadeIn('fast');
			return false;
		})
const escapeHtml = (str) => {
  // Verifica se a string contém tags <code> ou <pre>
  if (/<code>|<\/code>|<pre>|<\/pre>/g.test(str)) {
    // Retorna a string sem substituir os caracteres dentro das tags
    return str;
  }

  // Substitui os caracteres especiais com seus respectivos códigos HTML
  str = str.replace(/[&<>"'`{}()\[\]]/g, (match) => {
    switch (match) {
      
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '{': return '&#123;';
      case '}': return '&#125;';
      case '(': return '&#40;';
      case ')': return '&#41;';
      case '[': return '&#91;';
      case ']': return '&#93;';
      default: return match;
    }
  });

  // Substitui o trecho ```codigo``` por <pre><code>codigo</code></pre>
  str = str.replace(/```(\w+)?([\s\S]*?)```/g, '<pre><code>$2</code><button class="copy-code" onclick="copyCode(this)"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> <span class="label-copy-code">'+lang["translate"][lang_index].copy_code1+'</span></button></pre>').replace(/(\d+\.\s)/g, "<strong>$1</strong>");

  return str;
};

// Função para copiar o conteúdo da tag <pre>
function copyCode(button) {
  const pre = button.parentElement;
  const code = pre.querySelector('code');
  const range = document.createRange();
  range.selectNode(code);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
  button.innerHTML = lang["translate"][lang_index].copy_code2;
}
	
		// Clear Chat
		function clearChat(target) {
		  // Display confirmation dialog using SweetAlert2 library
		  Swal.fire({
		    title: lang["translate"][lang_index].confirmation_delete_chat1,
		    text: lang["translate"][lang_index].confirmation_delete_chat2,
		    icon: 'warning',
		    showCancelButton: true,
		    confirmButtonColor: '#3085d6',
		    cancelButtonColor: '#d33',
		    confirmButtonText: lang["translate"][lang_index].confirmation_delete_chat3,
		    cancelButtonText: lang["translate"][lang_index].confirmation_delete_chat4
		  }).then((result) => {
		    // If user confirms deletion
		    if (result.isConfirmed) {
		      // If target is "all", clear chat history for all characters
		      if (target == "all") {
		        for (var i = 0; i < array_characters.length; i++) {
		          array_characters[i]['last_chat'] = [];
		        }
		        // Display success message using SweetAlert2
		        Swal.fire(
		          lang["translate"][lang_index].confirmation_delete_chat5,
		          lang["translate"][lang_index].confirmation_delete_chat_all,
		          'success'
		        )
		      } else {
		        // Otherwise, clear chat history for current character only
		        array_characters[data_index]['last_chat'] = [];
		        // Display success message using SweetAlert2
		        Swal.fire(
		          lang["translate"][lang_index].confirmation_delete_chat5,
		          lang["translate"][lang_index].confirmation_delete_current_chat,
		          'success'
		        )
		      }

		      // Clear chat display
		      $("#overflow-chat").html("");
		      // Reset chat history and add initial message
		      array_chat = [];
		      array_chat.push({
		        "name": character_name,
		        "message": character_training,
		        "training": true,
		        "date": currentDate()
		      })
		      // Save updated character data to local storage
		      localStorage.setItem("smartanimals_chat_v2", JSON.stringify(array_characters));

		      // If enabled, display welcome message for current character
		      if (displayWelcomeMessage) {
		        responseChat(array_characters[data_index]['welcome_message']);
		      }
		    }
		  })
		}

		function loadChat(){
		  if(chat_history){
		    checkClearChatDisplay();

		    for(var i=0; i<array_characters[data_index]['last_chat'].length; i++){
		      const currentChat = array_characters[data_index]['last_chat'][i];

		      if(currentChat.name === "User"){
		        if(currentChat.isImg === true){
		        	const imageID = Date.now(); 
							const imgURL = Array.isArray(currentChat.imgURL) ? currentChat.imgURL.map(url => url).join('') : '';
							const imgHtml = Array.isArray(currentChat.imgURL) ? currentChat.imgURL.map(url => `<div class="image-ia"><img  onerror="this.src='img/no-image.svg'" src="${url}"></div>`).join('') : '';
		          const chatHtml = `
		            <div class="chat border-character" style="border-color: ${character_background_color}">
		              ${avatar_in_chat}
		              ${audio_in_chat}
		              <div class="wrapper-name-and-chat">
		                <div class="name">${character_name}</div>
		                <div class="chat-response no-white-space">
		                  <p>${lang["translate"][lang_index].creating_ia_image} <strong class='ia-image-prompt-label'>${currentChat.message}</strong>
		                  <div class="wrapper-image-ia image_ia_${imageID}">
		                    ${imgHtml}
		                  </div>
		                  <p class='expire-img-message'>${lang["translate"][lang_index].expire_img_message}</p>
		                </div>
		                <div class='date-chat'><img src='img/icon-clock.svg'> ${currentChat.date || ''}</div>
		              </div>
		            </div>
		          `;
		          $("#overflow-chat").append(chatHtml);
		        }else{
		          const chatResponse = escapeHtml(currentChat.message)
		          const chatHtml = `
		            <div class="chat border-you">
		              <div class="wrapper-name-and-chat">
		                <div class="name">You</div>
		                <div class="chat-response">${chatResponse}</div>
		                <div class='date-chat'><img src='img/icon-clock.svg'> ${currentChat.date || ''}</div>
		              </div>
		            </div>
		          `;
		          $("#overflow-chat").append(chatHtml);
		        }

		        array_chat.push({"name":"User","message":currentChat.message,"isImg":true,imgURL: currentChat.imgURL,"date":currentDate()});

		      }else{
		        avatar_in_chat = display_avatar_in_chat ? `<div class="avatar-chat"><img src="${character_image}" alt="${character_name}" title="${character_name}"></div>` : '';
		        audio_in_chat = display_audio_button_answers ? `<div class='chat-audio'><img data-play="false" src='img/btn_tts_play.svg'></div>` : '';

		        if(!currentChat.training){
		          const chatResponse = escapeHtml(currentChat.message)
		          const chatHtml = `
		            <div class="chat border-character" style="border-color: ${character_background_color}">
		              ${avatar_in_chat}
		              ${audio_in_chat}
		              <div class="wrapper-name-and-chat">
		                <div class="name">${currentChat.name}</div>
		                <div class="chat-response">${chatResponse}</div>
		                <div class='date-chat'><img src='img/icon-clock.svg'> ${currentChat.date || ''}</div>
		              </div>
		            </div>
		          `;
		          $("#overflow-chat").append(chatHtml);
		        }

		        array_chat.push({"name":character_name,"message":currentChat.message,"training":currentChat.training,"date":currentDate()});
		      }
		    }
		    hljs.highlightAll();
		    setTimeout(function() {
		      scrollChatBottom();
		    }, 10);
		  }else{
		    if(displayWelcomeMessage){
		      responseChat(welcome_message);
		    }
		  }
		}


		//Check Clear Chat display
		function checkClearChatDisplay(){
			if(array_characters[data_index]['last_chat'].length > 1){
				if(chat_history){
					$("#clear-chat").show();
				}
			}else{
				$("#clear-chat").hide();
			}			

			const hasLastChat = array_characters.some((result) => {
			  return result.last_chat && result.last_chat.length > 2;
			});

			if (hasLastChat) {
			  $("#clear-all-chats").show();
			} else {
				$("#clear-all-chats").hide();
			}
		}		

		//Error messages
		function hideFeedback(){
			toastr.remove()
		}

		//Force chat to scroll down
		function scrollChatBottom(){
			let objDiv = document.getElementById("overflow-chat");
			objDiv.scrollTop = objDiv.scrollHeight;
			hljs.highlightAll();
		}

		//Enable chat input
		function enableChat(){
				$(".character-typing").hide();
				$(".btn-send-chat,#chat").attr("disabled",false);
	  		var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			  if(!isMobile) {
			    setTimeout(function() {
			      $('#chat').focus();
			    }, 300);
			  }

		}

		//Disable chat input
		function disableChat(){
				$(".character-typing").fadeIn();
				$(".character-typing").css('display','flex');
				$(".character-typing span").html(character_name);
				$(".btn-send-chat,#chat").attr("disabled",true);
		}

		function createTextFile(data) {
		  let text = "";

		  // Iterate over the array_chat array and add each message to the text variable
		  data.shift();
		  data.forEach(chat => {
		    text += `${chat.name}: ${chat.message}\r\n`;
		  });

		  text = text.replace("User:", lang["translate"][lang_index].you+":");

		  // Create a Blob object with the text
		  const blob = new Blob([text], { type: "text/plain" });

		  // Return the Blob object
		  return blob;
		}

		// Function to download the file
		function downloadFile(blob, fileName) {
		  // Create a URL object with the Blob
		  const url = URL.createObjectURL(blob);

		  // Create a download link and add it to the document
		  const link = document.createElement("a");
		  link.href = url;
		  link.download = fileName;
		  document.body.appendChild(link);

		  // Simulate a click on the link to trigger the download
		  link.click();

		  // Remove the link from the document
		  document.body.removeChild(link);
		}

		// Function to handle the download button click event
		function handleDownload() {
		  const blob = createTextFile(array_chat);
		  downloadFile(blob, "chat.txt");
		}

		//Chat audio
		$(document).on("click", ".chat-audio", function() {
		  var $this = $(this);
		  var $img = $this.find("img");
		  var $chatResponse = $this.siblings(".wrapper-name-and-chat").find(".chat-response");
		  var play = $img.attr("data-play") == "true";

		  if (play) {
		    cancelSpeechSynthesis();
		  }

		  $img.attr({
		    "src": "img/btn_tts_" + (play ? "play" : "stop") + ".svg",
		    "data-play": play ? "false" : "true"
		  });

		  if (!play) {
		    cancelSpeechSynthesis();

		    // Remove botão de cópia do texto antes de sintetizar a fala
		    var chatResponseText = $chatResponse.html().replace(/<button\b[^>]*\bclass="[^"]*\bcopy-code\b[^"]*"[^>]*>.*?<\/button>/ig, "");

		    // Verifica se o recurso é suportado antes de chamar a função
		    if ('speechSynthesis' in window) {
		      doSpeechSynthesis(chatResponseText);
		    }
		  }
		});

		function cleanStringToSynthesis(str) {
		  str = str.replace(/<[^>]*>/g, "").replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{1F1E0}-\u{1F1FF}|\u{1F200}-\u{1F2FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}]/gu, '');
		  return str;
		}

		function cancelSpeechSynthesis(){
			window.speechSynthesis.cancel();
		}		

		function doSpeechSynthesis(longText){
			longText = cleanStringToSynthesis(longText)

		  // The maximum number of characters in each part
		  const maxLength = 150;

		  // Divide the text into smaller parts
		  const textParts = [];
		  let startIndex = 0;
		  while (startIndex < longText.length) {
		    let endIndex = Math.min(startIndex + maxLength, longText.length);
		    if (endIndex < longText.length) {
		      endIndex = longText.lastIndexOf(' ', endIndex);
		    }
		    textParts.push(longText.substring(startIndex, endIndex));
		    startIndex = endIndex + 1;
		  }

		  // Create SpeechSynthesisUtterance instances for each piece of text
		  const utterances = textParts.map(textPart => {
		    const utterance = new SpeechSynthesisUtterance(textPart);
		    utterance.lang = audio_button_lang;
		    return utterance;
		  });

		  // Define the end of speech event
		  utterances[utterances.length - 1].addEventListener("end", () => {
		    $(".chat-audio img").attr("src", "img/btn_tts_play.svg");
		    $(".chat-audio img").attr("data-play", "false");
		  });

		  // Read each piece of text sequentially
		  function speakTextParts(index = 0) {
		    if (index < utterances.length) {
		      speechSynthesis.speak(utterances[index]);
		      utterances[index].addEventListener("end", () => speakTextParts(index + 1));
		    }
		  }

		  //Begin speak
		  speakTextParts();
		}

		function mobileMenu(){
			$(".mobile-menu-toogle").toggle();
		}


		//Swiper JS (Carousel)
		let swiperCharacters = new Swiper(".swiperCharacters", {
			spaceBetween: 30,
			loop: false,
			centeredSlides:false,
			navigation: {
			  nextEl: ".swiper-button-next1",
			  prevEl: ".swiper-button-prev1",
			},
		  scrollbar: {
		    el: ".swiper-scrollbar",
		    hide: true,
		  },
	      breakpoints: {  
	        200: {
	          spaceBetween: 15,
	          slidesPerView:1.1,
	        },      	
	        400: {
	          spaceBetween: 20,
	          slidesPerView:1.3,
	        },              
	        640: {
	          slidesPerView:2.2,
	        },
	        768: {
	          slidesPerView: 2.3,
	        },
	        1024: {
	          slidesPerView: 3.1,
	        },
	        1366: {
	          slidesPerView: 3.8,
	        },
	        1440: {
	          slidesPerView: 4.2,
	        },
	        1600: {
	          slidesPerView: 4.2,
	        },
	        1920: {
	          slidesPerView: 5.8,
	        },
	      },  	  
		});

		toastr.options = {
			  "closeButton": true,
			  "debug": false,
			  "newestOnTop": false,
			  "progressBar": true,
			  "positionClass": "toast-bottom-full-width",
			  "preventDuplicates": true,
			  "onclick": null,
			  "showDuration": "300",
			  "hideDuration": "1000",
			  "timeOut": "5000",
			  "extendedTimeOut": "2000",
			  "showEasing": "swing",
			  "hideEasing": "linear",
			  "showMethod": "fadeIn",
			  "hideMethod": "fadeOut"
		}