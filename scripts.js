const Modal = {
  open() {
    // Abrir modal
    // Adicionar a classe active ao modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    // fechar o Modal
    //remover a classe active do modal
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.fincances:transactions", JSON.stringify(transactions))
    },
};


// Preciso somar as entradas e depois somar as saídas e remover das entradas.

const Transaction = {
  all: Storage.get(),
  /* dados em array: 
  [
    {
      description: "Luz",
      amount: -50000,
      date: "23/01/2021",
    },
    {
      description: "Website",
      amount: 500000,
      date: "23/01/2021",
    },
    {
      description: "Internet",
      amount: -20000,
      date: "23/01/2021",
    },
    {
      description: "App",
      amount: 200000,
      date: "23/01/2021",
    },
  ],*/

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // pegar todas as transações
    Transaction.all.forEach((transaction) => {
      // para cada transação, verificar se a transação é maior que zero
      if (transaction.amount > 0) {
        // se for maior que zero, somar a variavel e retornar
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;
    // pegar todas as transações
    Transaction.all.forEach((transaction) => {
      // para cada transação, verificar se a transação é menor que zero
      if (transaction.amount < 0) {
        // se for maior que zero, somar a variavel e retornar
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Substituir os dados do HTML com os dados do js

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
        </td>
        `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      // verificar se todas as informações foram preenchidas
      Form.validateFields();
      // formatar os dados para salvar
      const transaction = Form.formatValues();
      // salvar
      Transaction.add(transaction);
      // apagar os dados do formulario
      Form.clearFields();
      // fechar Modal
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
