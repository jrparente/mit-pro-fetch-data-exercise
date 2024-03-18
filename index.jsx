const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item mr-1">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("result", result);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data.docs });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { useState } = React;
  const [query, setQuery] = useState("The Lord of the Rings");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://openlibrary.org/search.json?q=the+lord+of+the+rings&lang=eng&sort=rating",
    {
      hits: [],
    }
  );

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  console.log("data", data);
  let page = data;

  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <div className="d-flex flex-column" style={{ gap: "1rem" }}>
      <form
        onSubmit={(event) => {
          doFetch(
            `https://openlibrary.org/search.json?q=${query}&lang=eng&sort=rating`
          );
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : page && page.length > 0 ? (
        <>
          <ul className="grid">
            {page.map((item) => (
              <li key={item.objectID} className="grid-item">
                <img
                  src={`https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`}
                  alt={item.title}
                />
              </li>
            ))}
          </ul>
          <Pagination
            items={data}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          ></Pagination>
        </>
      ) : (
        <div>No data fetched</div>
      )}
    </div>
  );
}

// ========================================

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
