import React from 'react';
import './styles/loading.css';
import './styles/normalize.css';
import './styles/styles.css';

//На первый взгляд код кажется громоздким, но я все подробно расписал.
// В реальном приложении нужно будет все разбивать на компоненты и использовать Redux
class App extends React.Component{
  constructor(props) {
    super(props)

    //Начальное состояние
    this.state = {
      data: [], //будут данные с сервера
      isLoaded: false, //Состояние для страницы загрузки, пока не подгрузилась информация с сервера
      content: { //сюда их разделим для рендеринга на страницу
        exams:[],
        subjects: [],
        numbers: [],
        themes: [],
      },  
      exam: {}, //тут будут данные, которые потом отправим на сервер
      subject: {},
      num: [],
      all_questions_count: []
    }

    const token = 'Token 7ecb81f446fb4decf08d59d8616d828d45822e02';
    const urlForGetAllInfo = 'https://stagging.adaptaki.ru/api/tags/tree/';

    window.onload = () => {
      fetch(urlForGetAllInfo, {
        headers: {
          'Authorization': token
        }
      })
      .then(responce => responce.json())
      .then((data) => {
        this.setState({
          data
        })
        //получаем данные с сервера и раскладываем, с помощью циклов в state.content для удобного рендеринга на страницу
        const exams = this.state.data.exams
        const content = this.state.content
        for (let exam in exams) {
            content.exams.push({
              title: exams[exam].title,
              id: exam
            })
            for (let subject in exams[exam].subjects) {
                let sub = exams[exam].subjects[subject]
                  content.subjects.push({
                    title: sub.title,
                    id: subject
                  })
                  for (let num in sub.nums) {
                    let n = sub.nums[num]
                    content.numbers.push({
                      num,
                      all_questions_count: n.all_questions_count
                    })
                    for (let theme in n.themes) {
                      content.themes.push(n.themes[theme]);
                      const newContent = { ...this.state.content };
                      newContent.themes[theme].questions_count = 0;
                      this.setState({ content: newContent });
                    }
                  }
             }
        }
        this.setState({
          isLoaded: true
        })  
      })
      .catch((error) => {
        console.error(error.name + ' ОШИБКА ' + error.massage)
      });
    }
  }

  postDateToServe = (exam, subject, num, count) => {
    //фунцкция для отправки, форматирования данных в json и отправки на сервер
    const contentForSend = {};
    if (Object.keys(exam).length === 0 || Object.keys(subject).length === 0) {
      alert('Выберите экзамен и предмет')
    } else {
      //создаем объект для отправки 
      contentForSend.exam = Number(exam);
      contentForSend.subject = Number(subject);
      if (num.length === 0) {
        contentForSend.questions = [];
        contentForSend.questions.push({
          num: Number(num),
          count: Number(count)
        }) 
      } else if (num.length > 1) {
        contentForSend.questions= [];
        for (let n in num) {
          contentForSend.questions.push({
            num: Number(num[n]),
            count: Number(count[n])
          }) 

        }
      }
      const urlFoSend = 'https://stagging.adaptaki.ru/api/utrs/'
      const token = 'Token 7ecb81f446fb4decf08d59d8616d828d45822e02'
      fetch(urlFoSend , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Authorization': token
        },
        body: JSON.stringify(contentForSend)
      })
      .then(responce => responce.json())
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.error(error.name + ' ОШИБКА ' + error.massage)
      });
    }
  }

  genereteAndSendVariant = (theme) => {
    //функция для генерации варианта, форматирования в json и отправки на сервер
    const contentForSend = {};
    contentForSend.exam = 7; //тут будет id экзамена и предмета в переменных
    contentForSend.subject = 5; //в этот раз смысла в этом нет. 
    contentForSend.questions = []
    const questionFilter = theme.filter(item => item.questions_count > 0);
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
    contentForSend.questions.push({
      num: getRandomInt(20), //вариант сделал рандомный 
      themes: []
    });
    questionFilter.map((p, i) => {//отфильтровываем темы с пустыми count
      contentForSend.questions[0].themes.push({
        id: questionFilter[i].id,
        count: questionFilter[i].questions_count
      })
    })
    const urlFoSend = 'https://stagging.adaptaki.ru/api/utrs/'
    const token = 'Token 7ecb81f446fb4decf08d59d8616d828d45822e02'
    fetch(urlFoSend , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': token
      },
      body: JSON.stringify(contentForSend)
    })
    .then(responce => responce.json())
    .then((data) => {
      console.log(data)
    })
    .catch((error) => {
      console.error(error.name + ' ОШИБКА ' + error.massage)
    });
  }

  render() {
    const {isLoaded, content} = this.state
    if (!isLoaded) {
      return ( //Страница загрузки
        <div id="floatingBarsG">
          <div className="blockG" id="rotateG_01"></div>
          <div className="blockG" id="rotateG_02"></div>
          <div className="blockG" id="rotateG_03"></div>
          <div className="blockG" id="rotateG_04"></div>
          <div className="blockG" id="rotateG_05"></div>
          <div className="blockG" id="rotateG_06"></div>
          <div className="blockG" id="rotateG_07"></div>
          <div className="blockG" id="rotateG_08"></div>
        </div>
      )
    }
    else {      
      return (  //основная страница
        <div className="container">
          <h1 className="title">Adaptaki</h1>

          <div className="block">
            <h2 className="h2 examens__title">Выберите экзамен: </h2>

            <ul className="list">
                
                {
                  //Все компоненты, которых может быть несколько, рендерятся в цикле
                  content.exams.map((props, index) => { 
                    return (
                      <li key={index} className="examens__item">
                        <a className="examens__link link" href="#" 
                        onClick={ev => {
                          ev.preventDefault();
                          this.setState({
                            exam: content.exams[index].id
                          })
                          }}>
                          {content.exams[index].title}
                        </a>
                      </li>
                    )
                  })
                }
              </ul>                        
          </div>

            
          <div className="block">
            <h2 className="h2">Выберите предмет:</h2>
            
            <ul className="list"> 
                {
                content.subjects.map((p, index) => {
                  return (
                    <li className="subjects__item" key={index}>
                      <a href="#" className="subjects__link link"
                      onClick={ev => {
                        ev.preventDefault();
                          this.setState({
                            subject: content.subjects[index].id
                          })
                        }}
                      >{content.subjects[index].title}</a>
                    </li>
                  )
                })
                }
            </ul>
          </div>

          <div className="block numbers">
            <h2 className="h2">Выберите номер задания</h2>

            <ul className="list number__list">
              {
                content.numbers.map((p, index) => {
                  return (
                    <li className="item" key={index}>
                      <a href="#" className="link"
                      onClick={ev => {
                        ev.preventDefault()
                        let checkNum = this.state.num.find(item => item === content.numbers[index].num)
                        if(checkNum === undefined) {
                            this.setState(prevState => ({ 
                            num: [...prevState.num, content.numbers[index].num],
                            all_questions_count: [...prevState.all_questions_count, content.numbers[index].all_questions_count]
                          }))
                        }
                          
                      }}
                      >
                        {content.numbers[index].num}
                      </a>
                    </li>
                  )
                })
              }
            </ul>
          </div>

          <button className="btn"
          onClick={() => {this.postDateToServe(this.state.exam, this.state.subject, this.state.num, this.state.all_questions_count)}}
          >Отправить
          </button>

          <div className="block">
            <h2 className="h2">Конструктор варианта с заданиями</h2>
            
            <ul className="themes">
            { //Конструктор вариантов сделал отдельно
              content.themes.map((p, index) => {
                return (
                  <li key={index} className="themes__item">
                    <span className="themes__span">{content.themes[index].title}</span>
                    
                    <div className="themes__numbers">
                      <button className="themes__btn"
                      onClick={() => {
                        const newContent = { ...this.state.content };
                        if (newContent.themes[index].questions_count > 0) {
                          newContent.themes[index].questions_count--;
                          this.setState({ content: newContent });
                        } 
                      }}
                      >-</button>
                      <span className="link"
                      >{content.themes[index].questions_count}
                      </span>
                      <button className="themes__btn"
                      onClick={() => {
                        const newContent = { ...this.state.content };
                          newContent.themes[index].questions_count++;
                          this.setState({ content: newContent });
                      }}
                      >+</button>
                    </div>

                  </li>
                )
                
              })
             }
            </ul>

            <button className="btn"
              onClick={() => this.genereteAndSendVariant(content.themes)}
            >
              Сгенерировать свой вариант
            </button>
          </div>    
          
        </div>
      )
    } 
  }

}

export default App;
