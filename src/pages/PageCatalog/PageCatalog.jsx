import React, { useEffect, useState } from 'react'
import { clientEvents } from '../../events';
import { useSelector, useDispatch } from 'react-redux';
import './PageCatalog.scss';

import Card from '../../components/Card/Card'
import { Filter } from '../../components/Filter/Filter'
import { Sort } from '../../components/Sort/Sort'
import { Pagination } from '../../components/Pagination/Pagination'

import { getProducts } from '../../redux/productsSlice';

export const PageCatalog = () => {

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getProducts())
  }, [])

  const market = useSelector( state => state.market );

  const [filterParams, setFilterParams] = useState({
      themeCity: false,
      themeDuplo: false,
      themeFriends: false,
      themeHarryPotter: false,
      themeTechnic: false,
      ageTypeOne: false,
      ageTypeTwo: false,
      ageTypeThree: false,
      ageTypeFour: false,
      ageTypeFive: false,
      detailsFrom: '',
      detailsTo: Infinity,
      priceFrom: '',
      priceTo: Infinity,
  })

  const [sortParams, setSortParams] = useState({
    sort: 'name-up',
  })

  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    clientEvents.addListener('setFilterObj', setFilterParamsState);
    clientEvents.addListener('setSortObj', setSortParamsState);
    clientEvents.addListener('searchWithText', searchWithText);
    return () => {
      clientEvents.removeListener('setFilterObj', setFilterParamsState);
      clientEvents.removeListener('setSortObj', setSortParamsState);
      clientEvents.removeListener('searchWithText', searchWithText);
  }});

  const setFilterParamsState = obj => {
    setFilterParams(obj)
  }

  const setSortParamsState = obj => {
    setSortParams(obj)
  }

  const searchWithText = str => {
    setSearchText(str)
  }

  const filterAndSort = () => {

    let newArrTheme = [];
    let newArrAge = [];
    let newArrDetails = [];
    let newArrPrice = [];
    let newArrResult = [];
    let result = [];

    if (searchText) {
      market.products.slice().forEach(el => {
        if ((el.prodName).toLowerCase().includes(searchText.toLowerCase())) {
          newArrTheme.push(el)
        }
      });
    } else {
      newArrTheme = market.products.slice();
    }


    if (filterParams.themeCity || filterParams.themeDuplo || filterParams.themeFriends || filterParams.themeHarryPotter || filterParams.themeTechnic) {
      newArrTheme.forEach(el => {
        if ((filterParams.themeCity && el.theme === 'City') ||
        (filterParams.themeDuplo && el.theme === 'Duplo') ||
        (filterParams.themeFriends && el.theme === 'Friends') ||
        (filterParams.themeHarryPotter && el.theme === 'Harry-Potter') ||
        (filterParams.themeTechnic && el.theme === 'Technic'))
        {
          newArrAge.push(el)}
        }
          )
    } else {
      newArrAge = newArrTheme;
    } 

    if (filterParams.ageTypeOne || filterParams.ageTypeTwo || filterParams.ageTypeThree || filterParams.ageTypeFour || filterParams.ageTypeFive) {
      newArrAge.forEach(el => {
        if (((filterParams.ageTypeOne) && (el.age > 0 && el.age <= 3)) ||
        ((filterParams.ageTypeTwo) && (el.age > 3 && el.age <= 6)) ||
        ((filterParams.ageTypeThree) && (el.age > 6 && el.age <= 8)) ||
        ((filterParams.ageTypeFour) && (el.age > 8 && el.age <= 12)) ||
        ((filterParams.ageTypeFive) && (el.age > 12 && el.age <= 18)))
         newArrDetails.push(el)}) 
    } else {
      newArrDetails = newArrAge;
    } 

    if (filterParams.detailsFrom || filterParams.detailsTo) {
      newArrPrice = newArrDetails.filter(el => el.details >= filterParams.detailsFrom && el.details <= filterParams.detailsTo)
    } else {
      newArrPrice = newArrDetails;
    }

    if (filterParams.priceFrom || filterParams.priceTo) {
      newArrResult = newArrPrice.filter(el => el.price >= filterParams.priceFrom && el.price <= filterParams.priceTo)
    } else {
      newArrResult = newArrPrice;
    }

    newArrResult.forEach(el => {
      if (sortParams.sort === 'name-up') {
        newArrResult.sort((a,b) => a.prodName.localeCompare((b.prodName)))
      }
      if (sortParams.sort === 'name-down') {
        newArrResult.sort((a,b) => b.prodName.localeCompare((a.prodName)))
      }
      if (sortParams.sort === 'price-up') {
        newArrResult.sort((a,b) => a.price - b.price)
      }
      if (sortParams.sort === 'price-down') {
        newArrResult.sort((a,b) => b.price - a.price)
      }
    })

    if (newArrResult.length === 0 && !market.loading) {
      result = <div className='Message'>Искомые товары не найдены</div>
    }
    else {

      // let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; //массив, можно использовать массив объектов
      // let size = 3; //размер подмассива
      // let res = []; //массив в который будет выведен результат.
      // for (let i = 0; i <Math.ceil(array.length/size); i++){
      //     res[i] = array.slice((i*size), (i*size) + size);
      // }
      // console.log(res);

      result = newArrResult.map(el => 
        <Card key={el.id} product={el}></Card>
      )
    }
    return result;
  }
  console.log(market)
  return (
    <div className='PageCatalog'>
      <Filter filter={filterParams} />
      <section className='Section'>
        <Sort sort={sortParams}/>
        <div className='ItemsField'>
          {market.loading && <div className='Loading'>Загрузка...</div>}
          {(!market.loading && market.error) && <div className='Error'>Ошибка загрузки данных</div>}
          {filterAndSort()}
        </div>
      </section>
    </div>
  )
}