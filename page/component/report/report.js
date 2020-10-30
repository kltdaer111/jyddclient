const moment = require('moment');

Page({
  data: {
    pcode: '',
    confirm: false,
    common_duration: '',
    common_start: '',
    common_end: '',
    chosen: {},
    radiositems: [
      {name:'1', value:'施工'},
      {name:'2', value:'其它'}
    ],
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
    this.setData({
      common_start: common_start,
      common_end: common_end
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
        if(e.target.dataset.id == undefined){
          self.setData({
            common_start : res.date,
          });
        }
        else{
          let chosen = self.data.chosen;
          chosen[e.target.dataset.id].start = res.date;
          self.setData({
            chosen:chosen
          });
        }
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
        if(e.target.dataset.id == undefined){
          self.setData({
            common_end : res.date,
          });
        }
        else{
          let chosen = self.data.chosen;
          chosen[e.target.dataset.id].end = res.date;
          self.setData({
            chosen:chosen
          });
        }
      },
    });
  },
});