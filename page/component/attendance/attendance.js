const moment = require('moment');

Page({
  data : {
    staff : {}
  },
  onLoad(){
    let self = this;
    let today = moment().format('YYYY-MM-DD');
    let common_start = today + ' 08:00';
    let common_end = today + ' 17:00';
    dd.getStorage({
      key: 'myinfo',
      success: function(res){
        let myinfo = res.data;
        dd.httpRequest({
          headers: {
            "Content-Type": "application/json"
          },
          url: 'http://139.196.211.108:3000/ddclient',
          method: 'POST',
          // 需要手动调用JSON.stringify将数据进行序列化
          data: JSON.stringify({
            code: 4,
            data: {
              myinfo: myinfo,
            }
          }),
          dataType: 'json',
          success: function(res) {
            console.log(res);
            let data = res.data.res;
            let staff = {};
            for(let i = 0; i < data.length; i++){
              staff[data[i]['工号']] = {
                name : data[i]['姓名'],
                start : common_start,
                end : common_end
              }
            }
            console.log(staff);
            self.setData({
              staff : staff
            });
          },
          fail: function(res) {
            console.log(res);
            switch(res.status){
              case(452):{
                dd.alert({content: res.data.res});
              }
              break;
              default:{
                dd.alert({content: '提交失败,请检查网络'});
              }
            }
          },
        });
      },
      fail: (res)=>{
        console.log(res);
        dd.alert({content: res.errorMessage});
      }
    });
  },
  onChooseStartTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      success: (res) => {
        console.log(res);
        let chosen = self.data.staff;
        chosen[e.target.dataset.id].start = res.date;
        self.setData({
          staff : chosen
        });
      },
    });
  },
  onChooseEndTime(e){
    console.log(e);
    let self = this;
    dd.datePicker({
      format: 'yyyy-MM-dd HH:mm',
      //currentDate: self.data.common_end,
      success: (res) => {
        console.log(res);
        let chosen = self.data.staff;
        chosen[e.target.dataset.id].end = res.date;
        self.setData({
          staff:chosen
        });
      },
    });
  },
  onDelete(e){
    let chosen = this.data.staff;
    delete chosen[e.target.dataset.id];
    this.setData({
      staff:chosen
    });
  }
});