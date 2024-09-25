# from start_webdriver_2 import start_driver_2
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.wait import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from city_event_list import get_event_list
# from utils import remove_repeated_events
# from event_detail_info import get_event_detailinfo
from get_luma.get_data_luma import get_from_luma
from get_eventbrite.get_data_eventbrite import get_from_eventbrite
import requests


def main():
    event_data = []
    # event_data.extend(get_from_luma())
    event_data.extend(get_from_eventbrite())

    print(event_data)
    print(len(event_data))

if __name__ == "__main__":
    main()

