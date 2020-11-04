const moment = require('moment');

Page({
  data: {
    pcode: '',
    confirm: false,
    common_duration: '',
    common_start: '',
    common_end: '',
    section: [],

  },
  onLoad(){
    dd.getAuthCode({
      success:function(res){
          /*{
              authCode: 'hYLK98jkf0m' //string authCode
          }*/
          console.log(res);
      },
      fail:function(err){
      }
    });
    let today = moment().format('YYYY-MM-DD');
    let common_start = today + ' 08:00';
    let common_end = today + ' 17:00';
    let tmp = [];
    tmp.push({
      start: common_start,
      end: common_end,
      cons_checked: false,
      detail: {
        section_id: 0,
        first_open: true,
      }
    });
    this.setData({
      common_start: common_start,
      common_end: common_end,
      section: tmp,
      
    });
  },
  onChooseStartTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      currentDate: self.data.common_start,
      success: (res) => {
        console.log(res);
        let tmp = [...this.data.section];
        tmp[e.target.dataset.id].start = res.date
        self.setData({
          section: tmp
        });
      },
    });
  },
  onChooseEndTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      currentDate: self.data.common_end,
      success: (res) => {
        console.log(res);
        let tmp = [...this.data.section];
        tmp[e.target.dataset.id].end = res.date
        self.setData({
          section: tmp
        });
      },
    });
  },
  radioChange(e){
    console.log(e);
    let tmp = [...this.data.section];
    if(e.detail.value == '2'){
      tmp[e.target.dataset.id]['cons_checked'] = true;
    }else{
      tmp[e.target.dataset.id]['cons_checked'] = false;
    }
    this.setData({
      section:tmp
    })
  },
  onConsDetail(e){
    console.log(e);
    
    dd.navigateTo({
      url: './construction?obj=' + JSON.stringify(this.data.section[e.target.dataset.id]),
    })
  },
  onAddSection(e){
    console.log(e);
    let tmp = [...this.data.section];
    let index = tmp.length;
    tmp.push({
      start: this.data.common_start,
      end: this.data.common_end,
      cons_checked: false,
      detail: {
        section_id: index,
        first_open: true,
      }
    });
    this.setData({
      section:tmp
    });
  }
});