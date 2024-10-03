import React from 'react';

interface CalendarProps {
    tabIndex?: number;
}

const DashboardProgramCard: React.FC<CalendarProps> = ({tabIndex}) => {
    return (
        <div>
            <div className="lg:flex lg:h-full lg:flex-col">
                <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">
                        <time dateTime="2022-01">January 2022</time>
                    </h1>
                    <div className="flex items-center">
                        <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                            <button type="button"
                                    className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50">
                                <span className="sr-only">Previous month</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </button>
                            <button type="button"
                                    className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block">Today
                            </button>
                            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden"></span>
                            <button type="button"
                                    className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                <span className="sr-only">Next month</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:ml-4 md:flex md:items-center">
                        <div className="relative">
                            <button type="button"
                                    className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    id="menu-button" aria-expanded="false" aria-haspopup="true">
                                Month view
                                <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                                     aria-hidden="true">
                                    <path fill-rule="evenodd"
                                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </button>


                            {/*Dropdown menu, show/hide based on menu state.*/}

                            {/*Entering: "transition ease-out duration-100"*/}
                            {/*  From: "transform opacity-0 scale-95"*/}
                            {/*  To: "transform opacity-100 scale-100"*/}
                            {/*Leaving: "transition ease-in duration-75"*/}
                            {/*  From: "transform opacity-100 scale-100"*/}
                            {/*  To: "transform opacity-0 scale-95"*/}
                            <div
                                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu" aria-orientation="vertical" aria-labelledby="menu-button"
                                tabIndex={tabIndex}>
                                <div className="py-1" role="none">
                                    {/*Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" */}
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-item-0">Day view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-item-1">Week view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-item-2">Month view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-item-3">Year view</a>
                                </div>
                            </div>
                            <div className="ml-6 h-6 w-px bg-gray-300"></div>
                            <button type="button"
                                    className="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Add
                                event
                            </button>
                        </div>
                        <div className="relative ml-6 md:hidden">
                            <button type="button"
                                    className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500"
                                    id="menu-0-button" aria-expanded="false" aria-haspopup="true">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path
                                        d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
                                </svg>
                            </button>


                            {/*Dropdown menu, show/hide based on menu state.*/}

                            {/*Entering: "transition ease-out duration-100"*/}
                            {/*  From: "transform opacity-0 scale-95"*/}
                            {/*  To: "transform opacity-100 scale-100"*/}
                            {/*Leaving: "transition ease-in duration-75"*/}
                            {/*  From: "transform opacity-100 scale-100"*/}
                            {/*  To: "transform opacity-0 scale-95"*/}
                            <div
                                className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                role="menu" aria-orientation="vertical" aria-labelledby="menu-0-button"
                                tabIndex={tabIndex}>
                                <div className="py-1" role="none">
                                    {/* Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" */}
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-0">Create event</a>
                                </div>
                                <div className="py-1" role="none">
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-1">Go to today</a>
                                </div>
                                <div className="py-1" role="none">
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-2">Day view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-3">Week view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-4">Month view</a>
                                    <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem"
                                       tabIndex={tabIndex} id="menu-0-item-5">Year view</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
                    <div
                        className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                        <div className="flex justify-center bg-white py-2">
                            <span>M</span>
                            <span className="sr-only sm:not-sr-only">on</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>T</span>
                            <span className="sr-only sm:not-sr-only">ue</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>W</span>
                            <span className="sr-only sm:not-sr-only">ed</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>T</span>
                            <span className="sr-only sm:not-sr-only">hu</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>F</span>
                            <span className="sr-only sm:not-sr-only">ri</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>S</span>
                            <span className="sr-only sm:not-sr-only">at</span>
                        </div>
                        <div className="flex justify-center bg-white py-2">
                            <span>S</span>
                            <span className="sr-only sm:not-sr-only">un</span>
                        </div>
                    </div>
                    <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                        <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">

                            {/*Always include: "relative py-2 px-3"*/}
                            {/*Is current month, include: "bg-white"*/}
                            {/*Is not current month, include: "bg-gray-50 text-gray-500"*/}

                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">

                                {/*Is today, include: "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white"*/}

                                <time dateTime="2021-12-27">27</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2021-12-28">28</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2021-12-29">29</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2021-12-30">30</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2021-12-31">31</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-01">1</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-01">2</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-03">3</time>
                                <ol className="mt-2">
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Design
                                                review</p>
                                            <time dateTime="2022-01-03T10:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">10AM
                                            </time>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Sales
                                                meeting</p>
                                            <time dateTime="2022-01-03T14:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">2PM
                                            </time>
                                        </a>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-04">4</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-05">5</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-06">6</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-07">7</time>
                                <ol className="mt-2">
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Date
                                                night</p>
                                            <time dateTime="2022-01-08T18:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">6PM
                                            </time>
                                        </a>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-08">8</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-09">9</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-10">10</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-11">11</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-12"
                                      className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">12
                                </time>
                                <ol className="mt-2">
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Sam's
                                                birthday party</p>
                                            <time dateTime="2022-01-25T14:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">2PM
                                            </time>
                                        </a>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-13">13</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-14">14</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-15">15</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-16">16</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-17">17</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-18">18</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-19">19</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-20">20</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-21">21</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-22">22</time>
                                <ol className="mt-2">
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Maple
                                                syrup museum</p>
                                            <time dateTime="2022-01-22T15:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">3PM
                                            </time>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Hockey
                                                game</p>
                                            <time dateTime="2022-01-22T19:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">7PM
                                            </time>
                                        </a>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-23">23</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-24">24</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-25">25</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-26">26</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-27">27</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-28">28</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-29">29</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-30">30</time>
                            </div>
                            <div className="relative bg-white px-3 py-2">
                                <time dateTime="2022-01-31">31</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-01">1</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-02">2</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-03">3</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-04">4</time>
                                <ol className="mt-2">
                                    <li>
                                        <a href="#" className="group flex">
                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">Cinema
                                                with friends</p>
                                            <time dateTime="2022-02-04T21:00"
                                                  className="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">9PM
                                            </time>
                                        </a>
                                    </li>
                                </ol>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-05">5</time>
                            </div>
                            <div className="relative bg-gray-50 px-3 py-2 text-gray-500">
                                <time dateTime="2022-02-06">6</time>
                            </div>
                        </div>
                        <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">

                            {/*Always include: "flex h-14 flex-col py-2 px-3 hover:bg-gray-100 focus:z-10"*/}
                            {/*Is current month, include: "bg-white"*/}
                            {/*Is not current month, include: "bg-gray-50"*/}
                            {/*Is selected or is today, include: "font-semibold"*/}
                            {/*Is selected, include: "text-white"*/}
                            {/*Is not selected and is today, include: "text-indigo-600"*/}
                            {/*Is not selected and is current month, and is not today, include: "text-gray-900"*/}
                            {/*Is not selected, is not current month, and is not today: "text-gray-500"*/}

                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">

                                {/*Always include: "ml-auto"*/}
                                {/*Is selected, include: "flex h-6 w-6 items-center justify-center rounded-full"*/}
                                {/*Is selected and is today, include: "bg-indigo-600"*/}
                                {/*Is selected and is not today, include: "bg-gray-900"*/}

                                <time dateTime="2021-12-27" className="ml-auto">27</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2021-12-28" className="ml-auto">28</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2021-12-29" className="ml-auto">29</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2021-12-30" className="ml-auto">30</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2021-12-31" className="ml-auto">31</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-01" className="ml-auto">1</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-02" className="ml-auto">2</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-03" className="ml-auto">3</time>
                                <span className="sr-only">2 events</span>
                                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          </span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-04" className="ml-auto">4</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-05" className="ml-auto">5</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-06" className="ml-auto">6</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-07" className="ml-auto">7</time>
                                <span className="sr-only">1 event</span>
                                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          </span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-08" className="ml-auto">8</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-09" className="ml-auto">9</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-10" className="ml-auto">10</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-11" className="ml-auto">11</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 font-semibold text-indigo-600 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-12" className="ml-auto">12</time>
                                <span className="sr-only">1 event</span>
                                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          </span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-13" className="ml-auto">13</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-14" className="ml-auto">14</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-15" className="ml-auto">15</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-16" className="ml-auto">16</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-17" className="ml-auto">17</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-18" className="ml-auto">18</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-19" className="ml-auto">19</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-20" className="ml-auto">20</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-21" className="ml-auto">21</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 font-semibold text-white hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-22"
                                      className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">22
                                </time>
                                <span className="sr-only">2 events</span>
                                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          </span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-23" className="ml-auto">23</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-24" className="ml-auto">24</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-25" className="ml-auto">25</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-26" className="ml-auto">26</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-27" className="ml-auto">27</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-28" className="ml-auto">28</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-29" className="ml-auto">29</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-30" className="ml-auto">30</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-white px-3 py-2 text-gray-900 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-01-31" className="ml-auto">31</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-01" className="ml-auto">1</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-02" className="ml-auto">2</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-03" className="ml-auto">3</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-04" className="ml-auto">4</time>
                                <span className="sr-only">1 event</span>
                                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
            <span className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"></span>
          </span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-05" className="ml-auto">5</time>
                                <span className="sr-only">0 events</span>
                            </button>
                            <button type="button"
                                    className="flex h-14 flex-col bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:z-10">
                                <time dateTime="2022-02-06" className="ml-auto">6</time>
                                <span className="sr-only">0 events</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardProgramCard;