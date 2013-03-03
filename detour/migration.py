#!/usr/bin/env python
import os
from migrate.versioning.shell import main

import settings


db_url = settings.DATABASE_URL
app_path = os.path.relpath(os.path.dirname(os.path.abspath(__file__)),
                           os.getcwd())
repository = os.path.join(app_path, 'migrations')


if __name__ == '__main__':
    main(url=db_url, debug='True', repository=repository)
