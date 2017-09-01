(function(window, document) {

  function render({target, templatePath, dataPath, queryFrom = document}) {
    // 템플릿 가져오기
    const templatePromise = axios.get(templatePath)

    // 데이터 가져오기
    const dataPromise = axios.get(dataPath)

    // 둘다 완료되면...
    return Promise.all([templatePromise, dataPromise])
      .then(([templateRes, dataRes]) => {
        // 템플릿 렌더링하기
        const html = ejs.render(templateRes.data, {
          todos: dataRes.data
        })

        // 렌더링 결과를 문서에 주입하기
        const targetEl = queryFrom.querySelector(target)
        targetEl.innerHTML = html
        return targetEl
      })

      // 위에서 Promise를 반환하고 있기 때문에 render 함수의 반환값에 `.then`을 이어붙일 수 있습니다.
  }

  function loadTodos() {
    console.log('start loadTodos')
    render({
      target: '#todos',
      templatePath: '/templates/todos.ejs',
      dataPath: '/api/todos'
    }).then(todosEl => {
      todosEl.querySelectorAll('.todo-item').forEach(todoItem => {
        const id = todoItem.dataset.id
        
        // 체크박스 클릭시
        const checkboxEl = todoItem.querySelector('.todo-checkbox')
        checkboxEl.addEventListener('click', e => {
          axios.patch(`/api/todos/${id}`, {
            complete: e.currentTarget.checked
          }).then(res => {
            loadTodos()
          })
        })

        // 삭제 아이콘 클릭시
        const removeLink = todoItem.querySelector('.todo-remove')
        removeLink.addEventListener('click', e => {
          axios.delete(`/api/todos/${id}`).then(res => {
            loadTodos()
          })
        })
      })
    })
  }

  document.querySelector('#todo-form').addEventListener('submit', e => {
    e.preventDefault()
    const form = e.currentTarget
    axios.post('/api/todos', {
      title: form.elements.title.value
    })
      .then(loadTodos)
      .then(() => {
        form.elements.title.value = null
      })
  })

  loadTodos()
})(window, document)