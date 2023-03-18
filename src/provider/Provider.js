import React, { createContext, useReducer } from 'react';
import { InitialState } from './Reducer';
import axios from 'axios';
import Reducer from './Reducer';
import Types from './Types';

const Context = createContext({
   ...InitialState,
});

const Provider = ({ children }) => {
   const [store, dispatch] = useReducer(Reducer, InitialState);
   let finalDataWeekly = [];
   const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
   ];

   let weekData = [];

   const { expenses, weeklyExpense, budget, monthlyExpenses } = store;

   const handleErrors = (error) => {
      if (error.response) {
        if (error.response.status === 403) {
           alert(error.response.data.detail);
        } else if (error.response.status === 500) {
           alert(error.message);
        }
      }
      if (error.message == 'Network Error') {
        alert('Network Error');
      }
   };

   const fetchExpenses = async () => {
    try {
      await axios
          .get(`${process.env.REACT_APP_API}expenses/`, {
             auth: {
                username: process.env.REACT_APP_USER,
                password: process.env.REACT_APP_PASSWORD,
             },
          })
          .then((res) => {
            dispatch({
              type: Types.FETCH_EXPENSE,
              payload: res.data,
            });
          });
    } catch (error) {
      handleErrors(error);
    }
   };

   const deleteExpenseRequest = async (id) => {
    try {
      await axios
          .delete(`${process.env.REACT_APP_API}expenses/${id}`, {
             auth: {
                username: process.env.REACT_APP_USER,
                password: process.env.REACT_APP_PASSWORD,
             },
          })
          .then((res) => {
            dispatch({
              type: Types.DELETE_EXPENSE,
              payload: id,
            });
          });
    } catch (error) {
      handleErrors(error);
    }
   };

   const createExpenseRequest = async (data) => {
    try {
      await axios
        .post(`${process.env.REACT_APP_API}expenses/`, data, {
          auth: {
            username: process.env.REACT_APP_USER,
            password: process.env.REACT_APP_PASSWORD,
          },
        })
        .then((res) => {
          dispatch({
            type: Types.CREATE_EXPENSE,
            payload: {data, id: res.data.data.id},
          });
        });
    } catch (error) {
      handleErrors(error);
    }
  };

  const changeExpenseRequest = async (index, expense) => {
    try {
      await axios
        .put(`${process.env.REACT_APP_API}expenses/${expense.id}`, expense, {
          auth: {
            username: process.env.REACT_APP_USER,
            password: process.env.REACT_APP_PASSWORD,
          },
        })
        .then((res) => {
          dispatch({
            type: Types.EDIT_EXPENSE,
            payload: {index, expense},
          });
        });
    } catch (error) {
      handleErrors(error);
    }
  };

   const fetchData = async () => {
      try {
         await axios
            .get(`${process.env.REACT_APP_API}budget/`, {
               auth: {
                  username: process.env.REACT_APP_USER,
                  password: process.env.REACT_APP_PASSWORD,
               },
            })
            .then((res) => {
               dispatch({
                  type: Types.FETCH_BUDGET,
                  payload: res.data,
               });
            });

         await axios
            .get(`${process.env.REACT_APP_API}weekly_expenses/`, {
               auth: {
                  username: process.env.REACT_APP_USER,
                  password: process.env.REACT_APP_PASSWORD,
               },
            })
            .then((res) => {
               weekData = res.data;
               let totlamount = 0;
               let i = 0;
               weekData.map((da) => {
                  totlamount += weekData[i]?.total_amount;
                  if (finalDataWeekly.length >= 4) {
                     finalDataWeekly = [
                        ...finalDataWeekly,
                        {
                           time: da.week.toString() + '_' + da.year.toString(),
                           amount: da?.total_amount,
                           roll_avg: parseFloat((totlamount / 5).toFixed(2)),
                        },
                     ];
                     totlamount = totlamount - weekData[i - 4].total_amount;
                  } else {
                     finalDataWeekly = [
                        ...finalDataWeekly,
                        {
                           time: da.week.toString() + ' ' + da.year.toString(),
                           amount: da?.total_amount,
                        },
                     ];
                  }
                  i += 1;
               });
               dispatch({
                  type: Types.FETCH_WEEKLY_EXPENSE,
                  payload: finalDataWeekly,
               });
            });
         await axios
            .get(`${process.env.REACT_APP_API}monthly_expenses/`, {
               auth: {
                  username: process.env.REACT_APP_USER,
                  password: process.env.REACT_APP_PASSWORD,
               },
            })

            // await axios
            // .get(`${process.env.REACT_APP_API}monthly_expenses/`)
            .then((res) => {
               let finalMonthlyExp = [];
               let response = res.data;
               response.map((da) => {
                  finalMonthlyExp = [
                     ...finalMonthlyExp,
                     {
                        name: monthNames[da.month - 1],
                        Spent: da.spent,
                        Balance: da.balance,
                        CumSum: da.cum_sum,
                     },
                  ];
               });

               dispatch({
                  type: Types.FETCH_MONTHLY_EXPENSE,
                  payload: finalMonthlyExp,
               });
            });
      } catch (error) {
         // Handle errors
        handleErrors(error);
      }

      fetchExpenses();
   };

   return (
      <Context.Provider
         value={{
            expenses,
            budget,
            weeklyExpense,
            monthlyExpenses,
            fetchData,
            fetchExpenses,
            deleteExpenseRequest,
            createExpenseRequest,
            changeExpenseRequest
         }}
      >
         {children}
      </Context.Provider>
   );
};

export { Context, Provider };
