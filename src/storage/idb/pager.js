const DB_NAME = 'favbox_database_v2';

let dbPromise = null;

const openDb = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
};

// Gets one page of bookmarks, sorted by date, for the main bookmarks list.
// It reads the IndexedDB index directly instead of using jsstore, because jsstore
// would load and sort all matching bookmarks in memory before cutting the page.
// Reading the index directly lets us stop as soon as we have enough rows.
export default async function pageBookmarksByDate({
  cursor = null, limit = 50, sortDirection = 'desc', match = null,
} = {}) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const direction = sortDirection === 'asc' ? 'next' : 'prev';
    let range = null;
    if (cursor) {
      range = sortDirection === 'asc'
        ? IDBKeyRange.lowerBound(cursor.dateAdded)
        : IDBKeyRange.upperBound(cursor.dateAdded);
    }
    const rows = [];
    let scanned = 0;
    let pastCursor = !cursor;
    const done = () => {
      console.log(`dateAdded: ${rows.length} rows in scan of ${scanned} (${sortDirection}, ${cursor ? 'from cursor' : 'from start'})`);
      resolve(rows);
    };
    const request = db.transaction('bookmarks', 'readonly')
      .objectStore('bookmarks')
      .index('dateAdded')
      .openCursor(range, direction);
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const idbCursor = event.target.result;
      if (!idbCursor) {
        done();
        return;
      }
      scanned += 1;
      const row = idbCursor.value;
      if (!pastCursor) {
        if (row.dateAdded === cursor.dateAdded) {
          const passed = sortDirection === 'asc' ? row.id > cursor.id : row.id < cursor.id;
          if (!passed) {
            idbCursor.continue();
            return;
          }
        }
        pastCursor = true;
      }
      if (!match || match(row)) {
        rows.push(row);
      }
      if (rows.length >= limit) {
        done();
        return;
      }
      idbCursor.continue();
    };
  });
}
