<template>
  <div class="menu">
    <div class="menu-title">{{ tutorialTitle }}</div>
    <div class="menu-container">
      <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
      <div class="menu-item-title">
        {{ (item.index+1)+' '+item.name }}
      </div>
      <div v-if="item.sub_step_cnt>0" class="submenu">
        <div
          v-for="(subItem, subIndex) in item.sub_steps"
          :key="subIndex"
          @click="!isDisabled(item, subItem) && selectSubItem(item, subItem)"
          :class="{'submenu-item': true, 
                    'selected': item.index === stepId && subItem.index === subStepId,
                    'disabled': isDisabled(item, subItem)}"
          :title="subItem.overview"
        >
          <div class="submenu-item-header">
            <span class="submenu-item-index">{{ (item.index+1)+'.'+(subItem.index+1) }}</span>
            <span class="submenu-item-name">{{ subItem.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
    <button class="return-button" @click="goBack">
      <i class="fas fa-arrow-left"></i> 返回
    </button>
  </div>
</template>
  
  <script>
  import contentService from '@/services/contentService';


  export default {
    name: 'TutorialMenu',
    props:{
        tutorialId: {
            type: Number,
            required: true
        },
        stepId: {
            type: Number,
            required: false
        },
        subStepId: {
            type: Number,
            required: false
        },
        maxStepId: {
            type: Number,
            required: false
        },
        maxSubStepId: {
            type: Number,
            required: false
        }
    },
    data() {
      return {
        tutorialTitle: '',
        menuItems: [],
        progress: 25,
        hoveredSubItem: null
      };
    },
    created() {
      this.getMenuFramework();
    },
    methods: {
      goBack() {
        // Handle the go back action
        this.$router.push('/board');
      },
      getMenuFramework: async function(){
        const response = await contentService.getTutorialFramework(this.tutorialId);
        //console.log(JSON.stringify(response));
        if (response.status === "success") {
          this.tutorialTitle = response.title
          this.menuItems = response.steps;
        } else {
          if (response.status === "fail") {
            alert(response.info);
          } else {
            alert('Failed to fetch tutorial framework');
          }
          this.$router.push('/board');
        }
      },
      selectSubItem(item,subItem) {
        // Handle sub-item selection
        this.$emit('update-step-id', item.index, subItem.index);
        //this.$emit('update-sub-step-id', subItem.index);
      },
      isDisabled(item, subItem) {
        if (item.index > this.maxStepId) {
          return true;
        }
        if (item.index === this.maxStepId && subItem.index > this.maxSubStepId) {
          return true;
        }
        return false;
      }
    },
  };
  </script>
  
  <style scoped>
 .menu {
  width: 220px;
  background-color: #f4f4f4;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  position: relative;
}

.menu-title {
  font-size: 20px; /* Slightly reduce the font size to accommodate longer titles */
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 30px;
  margin-right: 10px;
  padding-right: 10px;
  color: #444444;
  white-space: normal; /* Allow the text to wrap */
  word-break: break-word; /* Break words if they are too long to fit */
  line-height: 1.2; /* Adjust line height for better readability */
}

.menu-container { 
  position: fixed;
  top:100px;
  bottom:110px;
  overflow-y: auto;
}

.menu-item {
  margin-bottom: 20px;
}

.menu-item-title {
  font-weight: normal;
  padding: 5px 0;
  font-size: 16px;
  color: #000000;
  position: relative;
  display: flex;
  align-items: center;
}

.menu-item-title::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #444444;
  margin-right: 10px;
}

.menu-item.selected .menu-item-title::before {
  background-color: #007bff;
}

.submenu {
  margin-left: 20px;
  margin-top: 5px;
}

.submenu-item {
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  color: #444444;
  transition: background-color 0.2s;
}

.submenu-item.disabled {
  color: grey;
  pointer-events: none; /* This makes the item non-clickable */
}

.submenu-item:hover {
  background-color: #e9ecef;
}

.submenu-item.selected {
  background-color: #007bff;
  color: #ffffff;
}

.submenu-item-header {
  display: flex;
  align-items: center;
}

.submenu-item-index {
  font-weight: bold;
  margin-right: 5px;
}


.submenu-item-name {
  flex-grow: 1;
}

.submenu-item-overview {
  font-size: 12px;
  color: #777777; /* Lighter color for the overview text */
  margin-top: 3px;
  margin-left: 15px;
}

.return-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #bbbbbb;
  border: #444444;
  color: #ffffff;
  border-radius: 20%;
  cursor: pointer;
  font-size: 16px; /* Make button text larger */
  border-radius: 25px; /* Round border */
  padding: 10px 20px; /* Bigger padding for larger button */
  width: 120px;
  box-sizing: border-box;
  position: fixed;
  left: 50px;
  bottom: 20px; /* Leave space for the progress indicator */
}

.return-button i {
  margin-right: 5px;
}

.progress-indicator {
  font-size: 18px;
  color: #8b8b8b;
  text-align: center;
  position: fixed;
  left: 60px;
  bottom: 70px;
  position: fixed;
}

.progress-indicator .percentage {
  font-weight: bold;
  color: #444444;
}

  </style>
  