<template>
    <div class="chat-interface">
      <div class="tutorial-title">
        {{tutorial_stitle}}
      </div>
      <div class="chat-container">
        <TutorialChatBlock v-for="(blk, index) in chatBlocks" :key="index" :block="blk" />
      </div>
      <div class="function-entry-container">
        <div class="function-buttons">
          <button v-for="(button, index) in functionButtons" :key="index" @click="selectFunction(button)">
            {{ button.label }}
          </button>
          <button class="add-button" @click="addFunction">+</button>
        </div>
        <div class="input-container">
          <div v-if="selectedFunction" class="function-tag">
            {{ selectedFunction.label }}
            <span @click="removeFunction">x</span>
          </div>
          <div v-if="quote" class="quote-section">
            {{ quote }}
            <span @click="removeQuote">x</span>
          </div>
          <textarea v-model="newMessage" placeholder="输入……"></textarea>
          <button @click="sendMessage" class="send-button">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import TutorialChatBlock from './TutorialChatBlock.vue';
  
  export default {
    components: {
      TutorialChatBlock,
    },
    data() {
      return {
        chatBlocks: [
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 1,
              "block_id": 1
            },
            "percentage": 10,
            "block_type": "tutorial",
            "data": {
              "content": "这是一个教程内容示例，包含**加粗文本**、序号列表和代码块。\n\n1. 第一步\n2. 第二步\n\n```python\nprint('Hello, World!')\n```\n",
              "user_input_content": {
                "desc": "请选择最符合你的选项。",
                "type": "multi_choices",
                "choices": [
                  { "choice_id": 1, "choice_content": "我之前就会这个" },
                  { "choice_id": 2, "choice_content": "我已经完全理解了" },
                  { "choice_id": 3, "choice_content": "我还想深入了解一下原理" }
                ],
                "user_input": -1
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 2,
              "block_id": 2
            },
            "percentage": 20,
            "block_type": "tutorial",
            "data": {
              "content": "请确认你已理解该内容，然后点击按钮继续。",
              "user_input_content": {
                "desc": "单选题的说明文字",
                "type": "single_choice",
                "choice_content": "我已理解，下一步",
                "user_input": false
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 3,
              "block_id": 3
            },
            "percentage": 30,
            "block_type": "tutorial",
            "data": {
              "content": "请在下方输入框中填写你的答案。",
              "user_input_content": {
                "desc": "文本输入题的说明文字",
                "type": "text_input",
                "user_input": ""
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 4,
              "block_id": 4
            },
            "percentage": 40,
            "block_type": "user",
            "data": {
              "query_input": {
                "input_content": "我有一个关于代码的问题。",
                "preset_function": "解释"
              },
              "query_quote": {
                "has_quote": true,
                "quote_content": {
                  "content": "请在下方输入框中填写你的答案。",
                  "source_block": {
                    "tutorial_id": "12a4d",
                    "step_id": 1,
                    "sub_step_id": 3,
                    "block_id": 3
                  }
                }
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 2,
              "sub_step_id": 1,
              "block_id": 5
            },
            "percentage": 50,
            "block_type": "user",
            "data": {
              "query_input": {
                "input_content": "我已经完全理解了这个步骤。",
                "preset_function": "Debug"
              },
              "query_quote": {
                "has_quote": false,
                "quote_content": {
                  "content": "",
                  "source_block": {
                    "tutorial_id": "",
                    "step_id": 0,
                    "sub_step_id": 0,
                    "block_id": 0
                  }
                }
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 1,
              "block_id": 1
            },
            "percentage": 10,
            "block_type": "tutorial",
            "data": {
              "content": "这是一个教程内容示例，包含**加粗文本**、序号列表和代码块。\n\n1. 第一步\n2. 第二步\n\n```python\nprint('Hello, World!')\n```\n",
              "user_input_content": {
                "desc": "请选择最符合你的选项。",
                "type": "multi_choices",
                "choices": [
                  { "choice_id": 1, "choice_content": "我之前就会这个" },
                  { "choice_id": 2, "choice_content": "我已经完全理解了" },
                  { "choice_id": 3, "choice_content": "我还想深入了解一下原理" }
                ],
                "user_input": -1
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 2,
              "block_id": 2
            },
            "percentage": 20,
            "block_type": "tutorial",
            "data": {
              "content": "请确认你已理解该内容，然后点击按钮继续。",
              "user_input_content": {
                "desc": "单选题的说明文字",
                "type": "single_choice",
                "choice_content": "我已理解，下一步",
                "user_input": false
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 3,
              "block_id": 3
            },
            "percentage": 30,
            "block_type": "tutorial",
            "data": {
              "content": "请在下方输入框中填写你的答案。",
              "user_input_content": {
                "desc": "文本输入题的说明文字",
                "type": "text_input",
                "user_input": ""
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 1,
              "sub_step_id": 4,
              "block_id": 4
            },
            "percentage": 40,
            "block_type": "user",
            "data": {
              "query_input": {
                "input_content": "我有一个关于代码的问题。",
                "preset_function": "解释"
              },
              "query_quote": {
                "has_quote": true,
                "quote_content": {
                  "content": "请在下方输入框中填写你的答案。",
                  "source_block": {
                    "tutorial_id": "12a4d",
                    "step_id": 1,
                    "sub_step_id": 3,
                    "block_id": 3
                  }
                }
              }
            }
          },
          {
            "user_id": "142ac",
            "block_index": {
              "tutorial_id": "12a4d",
              "step_id": 2,
              "sub_step_id": 1,
              "block_id": 5
            },
            "percentage": 50,
            "block_type": "user",
            "data": {
              "query_input": {
                "input_content": "我已经完全理解了这个步骤。",
                "preset_function": "Debug"
              },
              "query_quote": {
                "has_quote": false,
                "quote_content": {
                  "content": "",
                  "source_block": {
                    "tutorial_id": "",
                    "step_id": 0,
                    "sub_step_id": 0,
                    "block_id": 0
                  }
                }
              }
            }
          }
        ],
        newMessage: '',
        quote: '',
        selectedFunction: null,
        functionButtons: [
            { label: '解释' },
            { label: 'Debug' },
            { label: '可视化' },
            { label: '练习' },
        ],
        tutorial_stitle: 'Python基础教程'
      };
    },
    methods: {
      sendMessage() {
        if (this.newMessage.trim()) {
          this.messages.push(this.newMessage);
          this.newMessage = '';
          this.$nextTick(() => {
            const chatContainer = this.$el.querySelector('.chat-container');
            chatContainer.scrollTop = chatContainer.scrollHeight;
          });
        }
      },
      selectFunction(button) {
        this.selectedFunction = button;
      },
      removeFunction() {
        this.selectedFunction = null;
      },
      addFunction() {
        // Logic to add new function buttons if needed
      },
      removeQuote() {
        this.quote = '';
      },
    },
  };
  </script>
  
<style scoped>
.chat-interface {
  margin-left: 130px;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.tutorial-title {
  position:fixed;
  font-size: 24px;
  font-weight: bold;
  margin-left: 130px;
  padding: 10px;
}

.chat-container {
  position: absolute;
  flex-grow: 1;
  /* limit the height of the chat container */
  max-height: calc(100% - 100px);
  overflow-y: auto;
  display: flex;
  padding: 10px;
  margin-top: 50px;
  margin-left: 130px;
  flex-direction: column;
  padding-bottom: 150px;
  width: calc(100% - 300px); /* Adjust for menu width */
}

.function-entry-container {
  position: fixed;
  bottom: 5px;
  width: calc(100% - 520px); /* Adjust for menu width */
  margin-left: 130px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.function-buttons {
  display: flex;
  margin-bottom: 10px;
}

.function-buttons button {
  background: #f1f1f1;
  border: none;
  border-radius: 20px;
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.add-button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  cursor: pointer;
}

.input-container {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  position: relative;
}

.function-tag,
.quote-section {
  background: #f1f1f1;
  border-radius: 10px;
  margin-right: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.function-tag span,
.quote-section span {
  margin-left: 5px;
  cursor: pointer;
  color: #007bff;
}

textarea {
  flex-grow: 1;
  border: none;
  outline: none;
  resize: none;
  margin-right: 10px;
}

.send-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
}

.send-button i {
  font-size: 20px;
}

</style>
  