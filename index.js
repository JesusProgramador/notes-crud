const db = firebase.firestore();

const taskForm = document.querySelector('#task-form');
const taskContainer = document.querySelector('#tasks-container');

let editStatus = false;
let id = '';

const saveTask = (title, description) =>
    db.collection('tasks').doc().set({
        title: title,
        description: description
    });

const getTasks = () => db.collection('tasks').get();

const getTask = (id) => db.collection('tasks').doc(id).get();

const updateTask = (id, updatedTask) => db.collection('tasks').doc(id).update(updatedTask);

const deleteTask = (id) => db.collection('tasks').doc(id).delete();


const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback);

window.addEventListener('DOMContentLoaded', async(e) => {
    /* obtiene todas las tareas en base de datos cuando se recarga la pagina */

    onGetTasks((querySnapshot) => {
        taskContainer.innerHTML = '';

        querySnapshot.forEach((doc) => {
            /* muestra todos los datos de cada documento cuando se recorre el forEach */
            const task = doc.data();
            task.id = doc.id

            taskContainer.innerHTML += `
        <div class="card card-body mt-2 border-primary">
            <h5>${task.title}</h5>
            <p>${task.description}</p>

            <div>
              <button class="btn btn-primary btn-delete" data-id="${task.id}">
                Delete
              </button>
              <button class="btn btn-secondary btn-edit" data-id="${task.id}">
                Update
              </button>
            </div>
        </div>
        `;

            const btnsDelete = document.querySelectorAll(".btn-delete");
            /* recorre todos los botones que coinciden con la misma clase de arriba y les agrega o setea el evento de click a cada uno de ellos */
            btnsDelete.forEach(btn => {
                btn.addEventListener("click", async(e) => {
                    await deleteTask(e.target.dataset.id);
                });
            });

            const btnsEdit = document.querySelectorAll('.btn-edit');
            btnsEdit.forEach((btn) => {
                btn.addEventListener("click", async(e) => {
                    const doc = await getTask(e.target.dataset.id);
                    const task = doc.data();

                    editStatus = true;
                    id = doc.id;

                    taskForm['task-title'].value = task.title;
                    taskForm['task-description'].value = task.description;
                    taskForm['btn-task-form'].innerText = 'Update';
                });
            });
        })
    })
})

taskForm.addEventListener('submit', async(e) => {
    e.preventDefault()

    const title = taskForm['task-title'];
    const description = taskForm['task-description'];

    if (!editStatus) {
        await saveTask(title.value, description.value);
    } else {
        await updateTask(id, {
            title: title.value,
            description: description.value
        })

        editStatus = false;
        id = '';
        taskForm['btn-task-form'].innerText = 'Save';
    }
    /* obtiene automaticamente la nueva tarea creada sin necesidad de recargar la pagina, de esta manera pinta automaticamente la nueva tarea en la pagina */
    await getTasks();
    /* Resetea los valores del formulario cuando se hace submit */
    taskForm.reset();
    title.focus();
})