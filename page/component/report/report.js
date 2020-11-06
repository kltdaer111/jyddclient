const moment = require('moment');

Page({
  data: {
    commit: false,
    common_duration: '',
    common_start: '',
    common_end: '',
    section: [],
    myinfo: {},
  },
  onLoad(){
    // dd.getAuthCode({
    //   success:function(res){
    //       /*{
    //           authCode: 'hYLK98jkf0m' //string authCode
    //       }*/
    //       console.log(res);
    //   },
    //   fail:function(err){
    //   }
    // });
    let today = moment().format('YYYY-MM-DD');
    let common_start = today + ' 08:00';
    let common_end = today + ' 17:00';
    let tmp = [];
    let self = this;
    dd.getStorage({
      key: 'myinfo',
      success: function(res){
        let myinfo = res.data;
        self.setData({
          myinfo: {...myinfo}
        });
      },
      fail: (res)=>{
        console.log(res);
        dd.alert({content: res.errorMessage});
      }
    });
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
        tmp[e.target.dataset.id].start = res.date;
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
    tmp[e.target.dataset.id]['work'] = e.detail.value;
    if(e.detail.value == '项目施工'){
      tmp[e.target.dataset.id]['cons_checked'] = true;
    }else{
      tmp[e.target.dataset.id]['cons_checked'] = false;
    }
    this.setData({
      section: tmp,
    })
  },
  onConsDetail(e){
    console.log(e);
    
    dd.navigateTo({
      url: './construction?obj=' + JSON.stringify(this.data.section[e.target.dataset.id]),
    })
  },
  onAddSection(e){
    let self = this;
    dd.confirm({
      title: '提示',
      content: '添加工作内容?',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if(result.confirm == false){
          return;
        }
        console.log(e);
        let tmp = [...self.data.section];
        let index = tmp.length;
        tmp.push({
          start: self.data.common_start,
          end: self.data.common_end,
          cons_checked: false,
          detail: {
            section_id: index,
            first_open: true,
          }
        });
        self.setData({
          section:tmp
        });
      },
    });
    
  },
  onSubmit(e){
    console.log(e);
    dd.confirm({
      title: '提示',
      content: '是否汇报今日工作?',
      confirmButtonText: '是',
      cancelButtonText: '再检查一下',
      success: (result) => {
        if(result.confirm == false){
          return;
        }
        //TODO 校验
        let self = this;
        dd.httpRequest({
          headers: {
            "Content-Type": "application/json"
          },
          url: 'http://139.196.211.108:3000/ddclient',
          method: 'POST',
          // 需要手动调用JSON.stringify将数据进行序列化
          data: JSON.stringify({
            code: 3,
            data: {
              myinfo: self.data.myinfo,
              section: self.data.section,
            }
          }),
          dataType: 'json',
          success: function(res) {
            console.log(res);
            // if(res.data == undefined){
            //   dd.alert({content: '服务器故障'});
            //   self.setData({
            //     confirm : false
            //   });
            //   return;
            // }
            // let data = res.data.res;
            // //项目号录入错误时的处理
            // if(data == undefined){
            //   dd.alert({content: '该项目号不存在,请联系项目经理确认'});
            //   self.setData({
            //     confirm : false
            //   });
            //   return;
            // }
            let show = '上传成功';
            dd.alert({content: show});
            self.setData({
              commit : true,
            });
          },
          fail: function(res) {
            console.log(res);
            dd.alert({content: '提交失败,请检查网络'});
          },
          // complete: function(res) {
          //   console.log(res);
          //   dd.alert({content: 'complete'});
          // }
        });
      },
    });
    
  }
});